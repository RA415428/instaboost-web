package com.example.data

object AppRepository {

    val serviceOptions = listOf(
        ServiceOption("followers", "Instagram Followers", "👥👥👥👥", 0.1),
        ServiceOption("likes", "Instagram Likes", "❤️", 0.05),
        ServiceOption("views", "Reels Views", "👁️", 0.02),
        ServiceOption("comments", "Custom Comments", "💬", 0.2),
        ServiceOption("shares", "Reels Shares & Boost", "🚀", 0.15)
    )

    val hashtagCategories = listOf(
        HashtagCategory(
            id = "art",
            name = "Art",
            iconName = "brush",
            hashtags = listOf(
                "#art", "#artist", "#drawing", "#illustration", "#digitalart",
                "#artwork", "#sketch", "#instaart", "#painting", "#creative",
                "#artoftheday", "#design", "#draw", "#contemporaryart"
            )
        ),
        HashtagCategory(
            id = "fashion",
            name = "Fashion",
            iconName = "shirt",
            hashtags = listOf(
                "#fashion", "#style", "#ootd", "#fashionblogger", "#instafashion",
                "#streetwear", "#model", "#outfit", "#shopping", "#stylish",
                "#fashionista", "#mensfashion", "#womensfashion", "#lookbook"
            )
        ),
        HashtagCategory(
            id = "fitness",
            name = "Fitness",
            iconName = "dumbbell",
            hashtags = listOf(
                "#fitness", "#gym", "#workout", "#fit", "#fitnessmotivation",
                "#bodybuilding", "#training", "#health", "#lifestyle", "#fitfam",
                "#muscle", "#crossfit", "#gymlife", "#cardio"
            )
        ),
        HashtagCategory(
            id = "food",
            name = "Food",
            iconName = "utensils",
            hashtags = listOf(
                "#food", "#foodie", "#instafood", "#foodporn", "#yummy",
                "#delicious", "#foodstagram", "#foodphotography", "#dinner", "#homemade",
                "#chef", "#tasty", "#foodlover", "#healthyfood"
            )
        ),
        HashtagCategory(
            id = "instagram_growth",
            name = "Instagram Growth",
            iconName = "rocket",
            hashtags = listOf(
                "#instagramgrowth", "#socialmediamarketing", "#contentcreator", "#digitalmarketing",
                "#branding", "#followers", "#growth", "#reels", "#explorepage",
                "#viral", "#instagramstrategy", "#influencer", "#engagement"
            )
        ),
        HashtagCategory(
            id = "marketing",
            name = "Marketing",
            iconName = "target",
            hashtags = listOf(
                "#marketing", "#business", "#digitalmarketing", "#entrepreneur",
                "#branding", "#socialmedia", "#marketingdigital", "#smallbusiness",
                "#sales", "#advertising", "#seo", "#onlinebusiness"
            )
        ),
        HashtagCategory(
            id = "motivation",
            name = "Motivation",
            iconName = "zap",
            hashtags = listOf(
                "#motivation", "#mindset", "#inspiration", "#quotes",
                "#success", "#goals", "#lifestyle", "#motivationalquotes",
                "#positivity", "#hardwork", "#believe", "#hustle"
            )
        ),
        HashtagCategory(
            id = "photography",
            name = "Photography",
            iconName = "camera",
            hashtags = listOf(
                "#photography", "#photooftheday", "#nature", "#photographer",
                "#picoftheday", "#photo", "#love", "#portrait", "#landscape",
                "#travelphotography", "#canon", "#nikon", "#artistic"
            )
        ),
        HashtagCategory(
            id = "technology",
            name = "Technology",
            iconName = "cpu",
            hashtags = listOf(
                "#technology", "#tech", "#innovation", "#engineering",
                "#business", "#iphone", "#gadgets", "#programming", "#coding",
                "#ai", "#software", "#cybersecurity", "#futuretech"
            )
        ),
        HashtagCategory(
            id = "travel",
            name = "Travel",
            iconName = "plane",
            hashtags = listOf(
                "#travel", "#travelgram", "#instatravel", "#wanderlust",
                "#adventure", "#explore", "#nature", "#travelphotography", "#vacation",
                "#landscape", "#trip", "#tourist", "#holiday"
            )
        ),
        HashtagCategory(
            id = "reels_viral",
            name = "Reels & Viral",
            iconName = "video",
            hashtags = listOf(
                "#reels", "#reelsinstagram", "#viral", "#trending",
                "#reelsvideo", "#explore", "#explorepage", "#instareels", "#foryou",
                "#trendingaudio", "#reelsindia", "#viralreels"
            )
        )
    )

    val coinPackages = listOf(
        CoinPackage("pkg_100", 100, "₹30.00", 30.00),
        CoinPackage("pkg_500", 500, "₹130.00", 130.00, badge = "Popular"),
        CoinPackage("pkg_1000", 1000, "₹290.00", 290.00),
        CoinPackage("pkg_2000", 2000, "₹590.00", 590.00, badge = "Best Value"),
        CoinPackage("pkg_5000", 5000, "₹1,500.00", 1500.00),
        CoinPackage("pkg_10000", 10000, "₹3,000.00", 3000.00)
    )

    val subscriptionPackage = CoinPackage(
        id = "sub_100_monthly",
        coins = 100,
        priceINR = "₹30.00 / Month",
        priceNum = 30.00,
        isSubscription = true
    )

    val initialOrders = emptyList<Order>()
}
