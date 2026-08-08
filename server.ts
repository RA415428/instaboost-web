import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_ADMIN_CONFIG } from './src/utils/defaultAdminConfig';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Anti-caching middleware so AppCreator24 WebView always gets fresh app version & live rates
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Real-Time Central Data Store in Server Memory & Disk Persistence
let globalAdminConfig = { ...DEFAULT_ADMIN_CONFIG };
let globalOrders: any[] = [];
let globalUsersMap: Record<string, any> = {
  '100001': {
    id: 'usr_100001',
    memberId: '100001',
    name: 'User #100001',
    coins: 120,
    ordersCount: 2,
    status: 'ACTIVE',
    joinedDate: 'Aug 1',
    isOnline: false,
    lastActive: 'Offline (25m ago)',
    deviceType: 'Android App (APK)',
    currentScreen: 'Coins Store Screen',
    totalCoinsSpent: 300,
    location: 'India',
    updatedAt: Date.now() - 25 * 60 * 1000
  },
  '100002': {
    id: 'usr_100002',
    memberId: '100002',
    name: 'User #100002',
    coins: 450,
    ordersCount: 5,
    status: 'ACTIVE',
    joinedDate: 'Jul 28',
    isOnline: false,
    lastActive: 'Offline (3h ago)',
    deviceType: 'Android App (APK)',
    currentScreen: 'Order Create View',
    totalCoinsSpent: 1200,
    location: 'India',
    updatedAt: Date.now() - 3 * 3600 * 1000
  }
};
let globalActivityLogs: any[] = [];
let globalMemberCounter = 100003;

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'app_persisted_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

function loadPersistedState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.config) {
        globalAdminConfig = {
          ...DEFAULT_ADMIN_CONFIG,
          ...parsed.config,
          pricing: {
            ...DEFAULT_ADMIN_CONFIG.pricing,
            ...(parsed.config.pricing || {})
          },
          smmApi: {
            ...DEFAULT_ADMIN_CONFIG.smmApi,
            ...(parsed.config.smmApi || {})
          },
          ads: {
            ...DEFAULT_ADMIN_CONFIG.ads,
            ...(parsed.config.ads || {})
          },
          announcement: {
            ...DEFAULT_ADMIN_CONFIG.announcement,
            ...(parsed.config.announcement || {})
          }
        };
      }
      if (Array.isArray(parsed.orders)) globalOrders = parsed.orders;
      if (parsed.usersMap && typeof parsed.usersMap === 'object') {
        globalUsersMap = { ...globalUsersMap, ...parsed.usersMap };
      }
      if (typeof parsed.memberCounter === 'number') globalMemberCounter = parsed.memberCounter;
      console.log('Successfully loaded persisted admin config & server data from disk.');
    }
  } catch (err) {
    console.warn('Could not read state file, using defaults:', err);
  }
}

function savePersistedState() {
  try {
    const payload = {
      config: globalAdminConfig,
      orders: globalOrders,
      usersMap: globalUsersMap,
      memberCounter: globalMemberCounter
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save state file to disk:', err);
  }
}

// Load persisted state on server start
loadPersistedState();

// Serve ads.txt for Google AdSense verification
app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('google.com, pub-5869373074081897, DIRECT, f08c47fec0942fa0\n');
});

// --- API ROUTES ---

// 1. Get Realtime Admin Config (AdMob IDs, Pricing, Announcements, SMM API)
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: globalAdminConfig
  });
});

// 2. Update Admin Config (From Admin Panel)
app.post('/api/config', (req, res) => {
  try {
    const updated = req.body;
    if (updated && typeof updated === 'object') {
      globalAdminConfig = {
        ...globalAdminConfig,
        ...updated,
        lastUpdated: updated.lastUpdated || Date.now(),
        ads: {
          ...globalAdminConfig.ads,
          ...(updated.ads || {})
        },
        pricing: {
          ...globalAdminConfig.pricing,
          ...(updated.pricing || {})
        },
        announcement: {
          ...globalAdminConfig.announcement,
          ...(updated.announcement || {})
        },
        smmApi: {
          ...globalAdminConfig.smmApi,
          ...(updated.smmApi || {})
        }
      };
      savePersistedState();
      res.json({ success: true, config: globalAdminConfig });
    } else {
      res.status(400).json({ success: false, error: 'Invalid config format' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update config' });
  }
});

// 3. Get Realtime Orders
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    orders: globalOrders
  });
});

// 4. Create or Update Order
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    if (Array.isArray(orderData)) {
      globalOrders = orderData;
    } else if (orderData && orderData.id) {
      const idx = globalOrders.findIndex(o => o.id === orderData.id);
      if (idx >= 0) {
        globalOrders[idx] = { ...globalOrders[idx], ...orderData };
      } else {
        globalOrders.unshift(orderData);
      }
    }
    savePersistedState();
    res.json({ success: true, orders: globalOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save order' });
  }
});

// 5. Get Realtime Active & Offline Users
app.get('/api/users', (req, res) => {
  const now = Date.now();
  const usersList = Object.values(globalUsersMap).map((u: any) => {
    const lastActiveTime = u.updatedAt || 0;
    const timeDiffMs = now - lastActiveTime;
    // Consider online if active heartbeat was received within last 12 seconds
    const isOnline = lastActiveTime > 0 && timeDiffMs < 12000;

    let formattedLastActive = u.lastActive || 'Offline';
    if (isOnline) {
      formattedLastActive = 'Just now';
    } else if (lastActiveTime > 0) {
      const diffSecs = Math.floor(timeDiffMs / 1000);
      if (diffSecs < 60) {
        formattedLastActive = `Offline (${diffSecs}s ago)`;
      } else if (diffSecs < 3600) {
        formattedLastActive = `Offline (${Math.floor(diffSecs / 60)}m ago)`;
      } else if (diffSecs < 86400) {
        formattedLastActive = `Offline (${Math.floor(diffSecs / 3600)}h ago)`;
      } else {
        formattedLastActive = `Offline (${Math.floor(diffSecs / 86400)}d ago)`;
      }
    }

    return {
      ...u,
      isOnline,
      lastActive: formattedLastActive
    };
  });

  res.json({
    success: true,
    users: usersList
  });
});

// Save / Update Users list (From Admin Panel)
app.post('/api/users', (req, res) => {
  try {
    const usersData = req.body;
    if (Array.isArray(usersData)) {
      usersData.forEach((u: any) => {
        if (u && u.memberId) {
          globalUsersMap[u.memberId] = {
            ...(globalUsersMap[u.memberId] || {}),
            ...u,
            coinsUpdatedByAdmin: true
          };
        }
      });
    } else if (usersData && usersData.memberId) {
      globalUsersMap[usersData.memberId] = {
        ...(globalUsersMap[usersData.memberId] || {}),
        ...usersData,
        coinsUpdatedByAdmin: true
      };
    }
    savePersistedState();
    res.json({ success: true, users: Object.values(globalUsersMap) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update users' });
  }
});

// 5b. Reset Daily Ad Limit for All Users (Admin Action)
app.post('/api/users/reset-daily-ads', (req, res) => {
  try {
    Object.keys(globalUsersMap).forEach((memberId) => {
      if (globalUsersMap[memberId]) {
        globalUsersMap[memberId].dailyAdsWatched = 0;
      }
    });
    savePersistedState();
    res.json({ success: true, message: 'All users daily ad limits reset to 0.', users: Object.values(globalUsersMap) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset daily ad limits' });
  }
});

// 6. Sync User Account / Device Heartbeat (from Web or APK device)
app.post('/api/users/sync', (req, res) => {
  try {
    const user = req.body;
    if (user && user.memberId) {
      const existing = globalUsersMap[user.memberId] || {
        id: `usr_${user.memberId}`,
        memberId: user.memberId,
        name: `User #${user.memberId}`,
        coins: user.coins ?? 0,
        ordersCount: 0,
        status: 'ACTIVE',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isOnline: true,
        lastActive: 'Just now',
        deviceType: user.deviceType || 'Android App (APK)',
        currentScreen: 'User App View',
        totalCoinsSpent: 0,
        location: user.location || 'India'
      };

      const isBlocked = existing.status === 'BLOCKED';

      globalUsersMap[user.memberId] = {
        ...existing,
        ...user,
        name: existing.name || `User #${user.memberId}`,
        status: isBlocked ? 'BLOCKED' : (existing.status || 'ACTIVE'),
        // If admin updated coins directly, honor admin coin balance
        coins: existing.coinsUpdatedByAdmin ? existing.coins : (user.coins ?? existing.coins),
        lastActive: 'Just now',
        isOnline: true,
        updatedAt: Date.now()
      };

      savePersistedState();
      res.json({ success: true, user: globalUsersMap[user.memberId] });
    } else {
      res.status(400).json({ success: false, error: 'Member ID required' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to sync user' });
  }
});

// 7. Get New Member ID for Fresh Device Install
app.get('/api/member/new', (req, res) => {
  const assignedId = globalMemberCounter.toString();
  globalMemberCounter += 1;
  savePersistedState();
  res.json({
    success: true,
    memberId: assignedId
  });
});

// 8. Get Activity Logs
app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs: globalActivityLogs });
});

app.post('/api/logs', (req, res) => {
  try {
    const log = req.body;
    if (log && log.action) {
      globalActivityLogs.unshift(log);
      if (globalActivityLogs.length > 100) {
        globalActivityLogs = globalActivityLogs.slice(0, 100);
      }
    }
    res.json({ success: true, logs: globalActivityLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to log activity' });
  }
});


// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
