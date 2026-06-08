package com.buddy.voiceapp;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Fix D: garde l'écran allumé pendant toute la durée de l'app,
        // indépendamment du mode économie d'énergie Xiaomi/Android.
        // Plus fiable que navigator.wakeLock() seul dans un WebView.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
