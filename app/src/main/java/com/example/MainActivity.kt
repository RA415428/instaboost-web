package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.BottomNavBar
import com.example.ui.components.OrderSuccessDialog
import com.example.ui.components.PaymentSimulationDialog
import com.example.ui.components.PrivacyTermsDialog
import com.example.ui.components.RewardedAdDialog
import com.example.ui.components.SupportDialog
import com.example.ui.components.TopHeaderBar
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.LoadingScreen
import com.example.ui.screens.OrdersScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.StoreScreen
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.AppScreen
import com.example.viewmodel.AppViewModel
import com.example.viewmodel.MainTab

class MainActivity : ComponentActivity() {

    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            enableEdgeToEdge()
        } catch (_: Exception) {
        }

        setContent {
            val isDarkTheme by viewModel.isDarkTheme.collectAsState()

            MyApplicationTheme(darkTheme = isDarkTheme) {
                MainAppEntry(viewModel)
            }
        }
    }
}

@Composable
fun MainAppEntry(viewModel: AppViewModel) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val activeTab by viewModel.activeTab.collectAsState()
    val isConnected by viewModel.isInternetConnected.collectAsState()
    val wallet by viewModel.wallet.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val expandedCategory by viewModel.expandedCategoryId.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val toastMsg by viewModel.toastMessage.collectAsState()

    val showAdModal by viewModel.showAdModal.collectAsState()
    val adTimer by viewModel.adTimer.collectAsState()
    val isAdCompleted by viewModel.isAdCompleted.collectAsState()

    val showPaymentModal by viewModel.showPaymentModal.collectAsState()
    val selectedCoinPkg by viewModel.selectedCoinPackage.collectAsState()

    val activeDialog by viewModel.activeDialog.collectAsState()
    val lastPlacedOrder by viewModel.lastPlacedOrder.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        when (currentScreen) {
            AppScreen.SPLASH -> {
                SplashScreen()
            }
            AppScreen.LOADING -> {
                LoadingScreen(
                    isConnected = isConnected,
                    onRetry = { viewModel.retryConnection() }
                )
            }
            AppScreen.MAIN_APP -> {
                val screenTitle = when (activeTab) {
                    MainTab.TAGS -> "Dashboard"
                    MainTab.HOME -> "Home"
                    MainTab.COINS -> "Store"
                    MainTab.ORDERS -> "Orders"
                    MainTab.SETTINGS -> "Settings"
                }

                Scaffold(
                    topBar = {
                        TopHeaderBar(
                            title = screenTitle,
                            coinCount = wallet.coins,
                            onCoinClick = { viewModel.selectTab(MainTab.COINS) }
                        )
                    },
                    bottomBar = {
                        BottomNavBar(
                            selectedTab = activeTab,
                            onTabSelected = { viewModel.selectTab(it) }
                        )
                    },
                    containerColor = DarkBackground
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (activeTab) {
                            MainTab.TAGS -> {
                                DashboardScreen(
                                    wallet = wallet,
                                    expandedCategoryId = expandedCategory,
                                    onToggleCategory = { viewModel.toggleCategoryExpansion(it) },
                                    onWatchAdsClick = { viewModel.startRewardedAd() },
                                    onCopyIdClick = { viewModel.copyToClipboard(wallet.memberId, "Member ID") },
                                    onCopyHashtagsClick = { viewModel.copyToClipboard(it, "Hashtags") }
                                )
                            }
                            MainTab.HOME -> {
                                HomeScreen(
                                    wallet = wallet,
                                    onPlaceOrder = { service, url, qty, coins ->
                                        viewModel.placeOrder(service, url, qty, coins)
                                    },
                                    onBuyCoinsClick = { viewModel.selectTab(MainTab.COINS) }
                                )
                            }
                            MainTab.COINS -> {
                                StoreScreen(
                                    onBuyPackageClick = { viewModel.openPaymentModal(it) },
                                    onContactSupportClick = { viewModel.openDialog("SUPPORT") }
                                )
                            }
                            MainTab.ORDERS -> {
                                OrdersScreen(orders = orders)
                            }
                            MainTab.SETTINGS -> {
                                SettingsScreen(
                                    wallet = wallet,
                                    isDarkTheme = isDarkTheme,
                                    onToggleTheme = { viewModel.toggleTheme() },
                                    onNavigateTab = { viewModel.selectTab(it) },
                                    onOpenDialog = { viewModel.openDialog(it) },
                                    onCopyIdClick = { viewModel.copyToClipboard(wallet.memberId, "Member ID") }
                                )
                            }
                        }
                    }
                }
            }
        }

        // Floating Toast Banner
        AnimatedVisibility(
            visible = toastMsg != null,
            enter = slideInVertically(initialOffsetY = { -it }),
            exit = slideOutVertically(targetOffsetY = { -it }),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 40.dp, start = 16.dp, end = 16.dp)
        ) {
            toastMsg?.let { text ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF23283E))
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = text,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Overlays & Modals
        if (showAdModal) {
            RewardedAdDialog(
                adTimer = adTimer,
                isCompleted = isAdCompleted,
                onClaimReward = { viewModel.claimAdReward() },
                onDismiss = { viewModel.dismissAdModal() }
            )
        }

        if (showPaymentModal && selectedCoinPkg != null) {
            PaymentSimulationDialog(
                coinPackage = selectedCoinPkg!!,
                onConfirmPayment = { viewModel.confirmSimulatedPayment() },
                onDismiss = { viewModel.closePaymentModal() }
            )
        }

        when (activeDialog) {
            "ORDER_SUCCESS" -> {
                lastPlacedOrder?.let { order ->
                    OrderSuccessDialog(
                        order = order,
                        onDismiss = { viewModel.closeDialog() }
                    )
                }
            }
            "SUPPORT" -> {
                SupportDialog(onDismiss = { viewModel.closeDialog() })
            }
            "PRIVACY" -> {
                PrivacyTermsDialog(
                    title = "Privacy Policy",
                    content = """
                        1. Data Collection
                        SOX FOLLOW respects your privacy. We do not collect passwords or personal credentials. Only public Instagram handles or post URLs submitted during order placement are stored temporarily to process delivery.

                        2. Wallet & Coins
                        Coins earned via watching rewarded ads or in-app store purchases are linked to your Device ID / Member ID. Coins have no cash value outside the app ecosystem.

                        3. Ad Tracking
                        Rewarded ads are served via standard secure ad networks complying with Google Play Developer policies.

                        4. Support
                        For data deletion or privacy inquiries, contact support@soxfollow.com.
                    """.trimIndent(),
                    onDismiss = { viewModel.closeDialog() }
                )
            }
            "TERMS" -> {
                PrivacyTermsDialog(
                    title = "Terms & Conditions",
                    content = """
                        1. Service Usage
                        By using SOX FOLLOW, you agree to comply with Instagram terms of service. You must not use this app for spamming, harassment, or illegal content promotion.

                        2. Order Processing
                        Orders are processed immediately upon coin deduction. Delivery times vary depending on network traffic and target volume.

                        3. Refund Policy
                        In the event of unfulfilled orders due to incorrect links or deleted accounts, coins will be automatically refunded to your wallet balance.

                        4. Abuse Prevention
                        Automated ad-clicking or exploit attempts will result in permanent ban of Member ID.
                    """.trimIndent(),
                    onDismiss = { viewModel.closeDialog() }
                )
            }
            "LOGOUT" -> {
                PrivacyTermsDialog(
                    title = "Logout Session",
                    content = "You are currently logged in as Member #${wallet.memberId}. Logging out will save your coin balance to this device.",
                    onDismiss = { viewModel.closeDialog() }
                )
            }
        }
    }
}
