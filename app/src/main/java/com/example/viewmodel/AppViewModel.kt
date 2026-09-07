package com.example.viewmodel

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppRepository
import com.example.data.CoinPackage
import com.example.data.HashtagCategory
import com.example.data.Order
import com.example.data.OrderStatus
import com.example.data.ServiceOption
import com.example.data.UserWallet
import com.example.network.ConnectivityObserver
import com.example.network.NetworkConnectivityObserver
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class AppScreen {
    SPLASH,
    LOADING,
    MAIN_APP
}

enum class MainTab {
    TAGS,      // Dashboard / Hashtags section
    HOME,      // Place Order screen
    COINS,     // Store / Buy Coins
    ORDERS,    // Order History
    SETTINGS   // Settings & Support
}

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val connectivityObserver = NetworkConnectivityObserver(application)

    // App Navigation State
    private val _currentScreen = MutableStateFlow(AppScreen.MAIN_APP)
    val currentScreen: StateFlow<AppScreen> = _currentScreen.asStateFlow()

    private val _activeTab = MutableStateFlow(MainTab.HOME)
    val activeTab: StateFlow<MainTab> = _activeTab.asStateFlow()

    // Internet Connectivity State
    private val _networkStatus = MutableStateFlow(ConnectivityObserver.Status.Available)
    val networkStatus: StateFlow<ConnectivityObserver.Status> = _networkStatus.asStateFlow()

    private val _isInternetConnected = MutableStateFlow(true)
    val isInternetConnected: StateFlow<Boolean> = _isInternetConnected.asStateFlow()

    // User Wallet State
    private val _wallet = MutableStateFlow(UserWallet())
    val wallet: StateFlow<UserWallet> = _wallet.asStateFlow()

    // Orders History
    private val _orders = MutableStateFlow(AppRepository.initialOrders)
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    // Theme state
    private val _isDarkTheme = MutableStateFlow(true)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    // Expanded Hashtags categories
    private val _expandedCategoryId = MutableStateFlow<String?>("art")
    val expandedCategoryId: StateFlow<String?> = _expandedCategoryId.asStateFlow()

    // Rewarded Ad Simulation State
    private val _showAdModal = MutableStateFlow(false)
    val showAdModal: StateFlow<Boolean> = _showAdModal.asStateFlow()

    private val _adTimer = MutableStateFlow(5)
    val adTimer: StateFlow<Int> = _adTimer.asStateFlow()

    private val _isAdCompleted = MutableStateFlow(false)
    val isAdCompleted: StateFlow<Boolean> = _isAdCompleted.asStateFlow()

    // Payment Simulation State
    private val _selectedCoinPackage = MutableStateFlow<CoinPackage?>(null)
    val selectedCoinPackage: StateFlow<CoinPackage?> = _selectedCoinPackage.asStateFlow()

    private val _showPaymentModal = MutableStateFlow(false)
    val showPaymentModal: StateFlow<Boolean> = _showPaymentModal.asStateFlow()

    // Toast Notice State
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    // Support Modal & Legal Dialogs State
    private val _activeDialog = MutableStateFlow<String?>(null) // "SUPPORT", "PRIVACY", "TERMS", "ORDER_SUCCESS"
    val activeDialog: StateFlow<String?> = _activeDialog.asStateFlow()

    private val _lastPlacedOrder = MutableStateFlow<Order?>(null)
    val lastPlacedOrder: StateFlow<Order?> = _lastPlacedOrder.asStateFlow()

    init {
        // Observe network connectivity continuously
        viewModelScope.launch {
            try {
                connectivityObserver.observe().collect { status ->
                    _networkStatus.value = status
                    val isConnected = (status == ConnectivityObserver.Status.Available)
                    _isInternetConnected.value = isConnected
                }
            } catch (_: Exception) {
                _isInternetConnected.value = true
            }
        }

        // Handle splash screen flow smoothly
        viewModelScope.launch {
            try {
                delay(800) // Splash delay
                _currentScreen.value = AppScreen.LOADING
                delay(600) // Short loading transition
                _currentScreen.value = AppScreen.MAIN_APP
            } catch (_: Exception) {
                _currentScreen.value = AppScreen.MAIN_APP
            }
        }
    }

    fun selectTab(tab: MainTab) {
        _activeTab.value = tab
    }

    fun retryConnection() {
        val isConnected = connectivityObserver.isCurrentlyConnected()
        _isInternetConnected.value = isConnected
        if (isConnected) {
            _currentScreen.value = AppScreen.MAIN_APP
            showToast("Connected to Internet!")
        } else {
            showToast("Still no internet connection. Please try again.")
        }
    }

    fun toggleCategoryExpansion(id: String) {
        _expandedCategoryId.value = if (_expandedCategoryId.value == id) null else id
    }

    fun copyToClipboard(text: String, label: String = "Hashtags") {
        try {
            val clipboard = getApplication<Application>().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText(label, text)
            clipboard.setPrimaryClip(clip)
            showToast("$label copied to clipboard!")
        } catch (e: Exception) {
            showToast("Copied to clipboard!")
        }
    }

    fun showToast(msg: String) {
        _toastMessage.value = msg
        viewModelScope.launch {
            delay(3000)
            if (_toastMessage.value == msg) {
                _toastMessage.value = null
            }
        }
    }

    fun clearToast() {
        _toastMessage.value = null
    }

    // Rewarded Ad Simulation
    private var rewardedLocked = false
    private var activeTimerJob: Job? = null
    private var activeSeconds = 0
    private val navClickCounts = MainTab.values().associateWith { 0 }.toMutableMap()

    fun onNavigationButtonClicked(tab: MainTab, activity: android.app.Activity) {
        selectTab(tab)
        val count = (navClickCounts[tab] ?: 0) + 1
        navClickCounts[tab] = count
        if (count >= 3) {
            navClickCounts[tab] = 0
            com.example.ads.UnityAdsManager.showInterstitial(activity)
        }
    }

    fun onMainAppReady(activity: android.app.Activity) {
        startActiveTimer(activity)
    }

    fun onAppResumed(activity: android.app.Activity) {
        startActiveTimer(activity)
    }

    fun onAppPaused() {
        activeTimerJob?.cancel()
        activeTimerJob = null
        activeSeconds = 0
    }

    private fun startActiveTimer(activity: android.app.Activity) {
        if (activeTimerJob?.isActive == true) return
        activeTimerJob = viewModelScope.launch {
            while (true) {
                delay(1000)
                if (currentScreen.value != AppScreen.MAIN_APP) {
                    activeSeconds = 0
                    continue
                }
                if (!com.example.ads.UnityAdsManager.isAdShowing()) {
                    activeSeconds++
                    if (activeSeconds >= 240) {
                        activeSeconds = 0
                        com.example.ads.UnityAdsManager.showRewarded(activity, onCompleted = { }, onFailed = { })
                    }
                }
            }
        }
    }

    fun startRewardedAd(activity: android.app.Activity) {
        if (rewardedLocked) return
        if (_wallet.value.dailyAdsWatched >= _wallet.value.maxDailyAds) {
            showToast("Daily ad limit reached")
            return
        }
        rewardedLocked = true
        com.example.ads.UnityAdsManager.showRewarded(
            activity,
            onCompleted = {
                _wallet.update { it.copy(coins = it.coins + 10, dailyAdsWatched = it.dailyAdsWatched + 1) }
                showToast("You earned 10 coins!")
                viewModelScope.launch {
                    delay(10000)
                    rewardedLocked = false
                }
            },
            onFailed = { rewardedLocked = false }
        )
    }

    fun claimAdReward() {
        if (_isAdCompleted.value) {
            _wallet.update {
                it.copy(
                    coins = it.coins + 10,
                    dailyAdsWatched = (it.dailyAdsWatched + 1).coerceAtMost(it.maxDailyAds)
                )
            }
            _showAdModal.value = false
            showToast("🎉 +10 Coins added to your wallet!")
        }
    }

    fun dismissAdModal() {
        _showAdModal.value = false
    }

    // Payment Flow
    fun openPaymentModal(pkg: CoinPackage) {
        _selectedCoinPackage.value = pkg
        _showPaymentModal.value = true
    }

    fun closePaymentModal() {
        _showPaymentModal.value = false
        _selectedCoinPackage.value = null
    }

    fun confirmSimulatedPayment() {
        val pkg = _selectedCoinPackage.value ?: return
        viewModelScope.launch {
            delay(1200) // Simulate processing delay
            _wallet.update { it.copy(coins = it.coins + pkg.coins) }
            _showPaymentModal.value = false
            _selectedCoinPackage.value = null
            showToast("Success! ${pkg.coins} Coins added to your account.")
        }
    }

    // Order Placement
    fun placeOrder(
        serviceOption: ServiceOption,
        targetUrl: String,
        quantity: Int,
        requiredCoins: Int
    ): Boolean {
        if (targetUrl.isBlank()) {
            showToast("Please enter a valid Instagram URL or Username!")
            return false
        }

        if (_wallet.value.coins < requiredCoins) {
            showToast("Insufficient Coins! Need $requiredCoins coins. Watch ads or Buy Coins.")
            _activeTab.value = MainTab.COINS
            return false
        }

        // Deduct coins & create order
        _wallet.update { it.copy(coins = it.coins - requiredCoins) }

        val dateFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
        val newOrder = Order(
            id = "ORD-" + (10000..99999).random(),
            serviceType = serviceOption.name,
            targetUrl = targetUrl,
            quantity = quantity,
            coinsSpent = requiredCoins,
            status = OrderStatus.PROCESSING,
            dateFormatted = dateFormat.format(Date())
        )

        _orders.update { listOf(newOrder) + it }
        _lastPlacedOrder.value = newOrder
        _activeDialog.value = "ORDER_SUCCESS"
        showToast("Order placed successfully!")
        return true
    }

    fun openDialog(dialogName: String) {
        _activeDialog.value = dialogName
    }

    fun closeDialog() {
        _activeDialog.value = null
    }

    fun toggleTheme() {
        _isDarkTheme.value = !_isDarkTheme.value
    }
}
