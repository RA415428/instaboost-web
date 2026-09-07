package com.example.data

data class UserWallet(
    val coins: Int = 0,
    val memberId: String = "",
    val dailyAdsWatched: Int = 0,
    val maxDailyAds: Int = 10
)

enum class OrderStatus {
    PROCESSING, IN_PROGRESS, COMPLETED
}

data class Order(
    val id: String,
    val serviceType: String,
    val targetUrl: String,
    val quantity: Int,
    val coinsSpent: Int,
    val status: OrderStatus,
    val dateFormatted: String
)

data class HashtagCategory(
    val id: String,
    val name: String,
    val iconName: String,
    val hashtags: List<String>
)

data class CoinPackage(
    val id: String,
    val coins: Int,
    val priceINR: String,
    val priceNum: Double,
    val isSubscription: Boolean = false,
    val badge: String? = null
)

data class ServiceOption(
    val id: String,
    val name: String,
    val icon: String,
    val coinsPerUnit: Double,
    val minQuantity: Int = 10,
    val maxQuantity: Int = 10000
)
