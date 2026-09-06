package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.UserWallet
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.GoldCoin
import com.example.ui.theme.PrimaryPink
import com.example.ui.theme.PurpleAccent
import com.example.ui.theme.TextSecondary
import com.example.viewmodel.MainTab

@Composable
fun SettingsScreen(
    wallet: UserWallet,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
    onNavigateTab: (MainTab) -> Unit,
    onOpenDialog: (String) -> Unit,
    onCopyIdClick: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Settings",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 26.sp,
                    color = Color.White
                )
            )
        }

        // Member Profile Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(20.dp))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF262A45)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Verified Member",
                                tint = Color(0xFF5E72EB),
                                modifier = Modifier.size(30.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column {
                            Text(
                                text = "SOX MEMBER",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextSecondary,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "#${wallet.memberId}",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color(0xFF2B223D))
                            .border(1.dp, PrimaryPink.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                            .clickable { onCopyIdClick() }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copy ID",
                                tint = Color.White,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Copy ID",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // Options List Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(20.dp))
            ) {
                Column(modifier = Modifier.padding(8.dp)) {

                    SettingsRowItem(
                        icon = Icons.Default.Assignment,
                        title = "Order History",
                        subtitle = "View status of all placed orders",
                        onClick = { onNavigateTab(MainTab.ORDERS) }
                    )

                    SettingsRowItem(
                        icon = Icons.Default.MonetizationOn,
                        title = "Coin Wallet & Store",
                        subtitle = "Current Balance: ${wallet.coins} Coins",
                        iconTint = GoldCoin,
                        onClick = { onNavigateTab(MainTab.COINS) }
                    )

                    // Theme Toggle Item
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(DarkSurfaceVariant),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DarkMode,
                                    contentDescription = "Dark Theme",
                                    tint = PrimaryPink,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = "Dark Theme",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = if (isDarkTheme) "Enabled (Default)" else "Disabled",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }

                        Switch(
                            checked = isDarkTheme,
                            onCheckedChange = { onToggleTheme() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = PrimaryPink
                            )
                        )
                    }

                    SettingsRowItem(
                        icon = Icons.Default.PrivacyTip,
                        title = "Privacy Policy",
                        subtitle = "Data security & privacy guidelines",
                        onClick = { onOpenDialog("PRIVACY") }
                    )

                    SettingsRowItem(
                        icon = Icons.Default.Gavel,
                        title = "Terms & Conditions",
                        subtitle = "Usage rules & terms of service",
                        onClick = { onOpenDialog("TERMS") }
                    )

                    SettingsRowItem(
                        icon = Icons.Default.SupportAgent,
                        title = "Contact Support",
                        subtitle = "Get assistance with orders & coins",
                        onClick = { onOpenDialog("SUPPORT") }
                    )

                    SettingsRowItem(
                        icon = Icons.Default.Info,
                        title = "App Version",
                        subtitle = "v1.0.0 (Build 101) - High Performance",
                        showArrow = false,
                        onClick = {}
                    )

                    SettingsRowItem(
                        icon = Icons.Default.Logout,
                        title = "Logout",
                        subtitle = "Switch account or end session",
                        iconTint = Color(0xFFFF5252),
                        onClick = { onOpenDialog("LOGOUT") }
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
fun SettingsRowItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    iconTint: Color = PrimaryPink,
    showArrow: Boolean = true,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(DarkSurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = subtitle,
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        if (showArrow) {
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Open",
                tint = TextSecondary,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
