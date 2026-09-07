package com.instaboost.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UnityRewardedPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
