package com.buddy.voiceapp;

import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm != null) {
            PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Zova::AppActive");
            wl.acquire(8 * 60 * 60 * 1000L);
        }

        startForegroundService(new Intent(this, ZovaForegroundService.class));

        // Bridge JS→Android : mise à jour widget + lecture persona active
        getBridge().getWebView().addJavascriptInterface(new ZovaJSBridge(this), "ZovaBridge");

        // Tap widget → démarrer la conversation directement
        if (getIntent() != null && getIntent().getBooleanExtra("AUTO_START", false)) {
            triggerAutoStart(2500);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (intent != null && intent.getBooleanExtra("AUTO_START", false)) {
            triggerAutoStart(1000);
        }
    }

    private void triggerAutoStart(long delayMs) {
        getBridge().getWebView().postDelayed(() ->
            getBridge().getWebView().evaluateJavascript(
                "(function(){ var btn = document.getElementById('startBtn');" +
                " if (btn && !btn.disabled) btn.click(); })();",
                null
            ), delayMs
        );
    }

    // ── Bridge JS → Android ──────────────────────────────────────────────────

    class ZovaJSBridge {
        private final MainActivity activity;

        ZovaJSBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void setPersonaName(String name) {
            activity.getSharedPreferences(ZovaWidget.PREFS_NAME, MODE_PRIVATE)
                .edit().putString(ZovaWidget.KEY_PERSONA, name).apply();
            ZovaWidget.updateAllWidgets(activity);
        }
    }
}
