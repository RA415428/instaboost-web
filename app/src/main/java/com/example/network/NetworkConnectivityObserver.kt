package com.example.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged

interface ConnectivityObserver {
    enum class Status {
        Available, Unavailable, Losing, Lost
    }

    fun observe(): Flow<Status>
    fun isCurrentlyConnected(): Boolean
}

class NetworkConnectivityObserver(
    private val context: Context
) : ConnectivityObserver {

    private val connectivityManager: ConnectivityManager? by lazy {
        try {
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
        } catch (_: Exception) {
            null
        }
    }

    override fun observe(): Flow<ConnectivityObserver.Status> {
        return callbackFlow {
            val cm = connectivityManager
            if (cm == null) {
                trySend(ConnectivityObserver.Status.Available)
                awaitClose { }
                return@callbackFlow
            }

            val callback = object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    super.onAvailable(network)
                    trySend(ConnectivityObserver.Status.Available)
                }

                override fun onLosing(network: Network, maxMsToLive: Int) {
                    super.onLosing(network, maxMsToLive)
                    trySend(ConnectivityObserver.Status.Losing)
                }

                override fun onLost(network: Network) {
                    super.onLost(network)
                    trySend(ConnectivityObserver.Status.Lost)
                }

                override fun onUnavailable() {
                    super.onUnavailable()
                    trySend(ConnectivityObserver.Status.Unavailable)
                }
            }

            try {
                val request = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build()
                cm.registerNetworkCallback(request, callback)
            } catch (_: Exception) {
            }

            // Emit initial status
            val initialStatus = if (isCurrentlyConnected()) {
                ConnectivityObserver.Status.Available
            } else {
                ConnectivityObserver.Status.Available
            }
            trySend(initialStatus)

            awaitClose {
                try {
                    cm.unregisterNetworkCallback(callback)
                } catch (_: Exception) {
                }
            }
        }.distinctUntilChanged()
    }

    override fun isCurrentlyConnected(): Boolean {
        return try {
            val cm = connectivityManager ?: return true
            val network = cm.activeNetwork ?: return true
            val capabilities = cm.getNetworkCapabilities(network) ?: return true
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } catch (_: Exception) {
            true
        }
    }
}

