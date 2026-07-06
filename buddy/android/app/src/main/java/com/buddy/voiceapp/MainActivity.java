package com.buddy.voiceapp;

import android.content.Intent;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private AudioManager audioManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

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

    // Filet de sécurité : quand l'app passe en arrière-plan, on restaure le
    // routage audio normal pour ne pas laisser d'autres apps (Spotify, etc.)
    // coincées en mode "communication"/écouteur si le JS n'a pas nettoyé.
    @Override
    public void onStop() {
        super.onStop();
        if (audioManager != null) {
            audioManager.setSpeakerphoneOn(false);
            audioManager.setMode(AudioManager.MODE_NORMAL);
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
                "(function(){" +
                "  var pin = document.getElementById('pinScreen');" +
                "  function doStart(){" +
                "    var btn = document.getElementById('startBtn');" +
                "    if (btn && !btn.disabled) btn.click();" +
                "  }" +
                "  if (pin && pin.classList.contains('active')) {" +
                "    var obs = new MutationObserver(function(){" +
                "      if (!pin.classList.contains('active')) {" +
                "        obs.disconnect(); setTimeout(doStart, 400);" +
                "      }" +
                "    });" +
                "    obs.observe(pin, { attributes:true, attributeFilter:['class'] });" +
                "  } else { doStart(); }" +
                "})();",
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

        // getUserMedia (écho-annulation) fait basculer Android en mode
        // MODE_IN_COMMUNICATION, qui route par défaut vers l'écouteur au lieu
        // du haut-parleur — et peut affecter d'autres apps (Spotify) si on ne
        // le restaure pas. Le JS appelle ceci au démarrage/arrêt du micro.
        @JavascriptInterface
        public void setSpeakerAudio(final boolean enabled) {
            activity.runOnUiThread(() -> {
                if (activity.audioManager == null) return;
                if (enabled) {
                    activity.audioManager.setMode(AudioManager.MODE_NORMAL);
                    activity.audioManager.setSpeakerphoneOn(true);
                    // Chromium réaffirme son propre mode audio peu après le
                    // démarrage effectif de la piste micro — on réapplique le
                    // haut-parleur une fois que ça s'est stabilisé.
                    activity.getWindow().getDecorView().postDelayed(() -> {
                        if (activity.audioManager == null) return;
                        activity.audioManager.setMode(AudioManager.MODE_NORMAL);
                        activity.audioManager.setSpeakerphoneOn(true);
                    }, 400);
                } else {
                    activity.audioManager.setSpeakerphoneOn(false);
                    activity.audioManager.setMode(AudioManager.MODE_NORMAL);
                }
            });
        }

        @JavascriptInterface
        public void setPersonaName(String name) {
            activity.getSharedPreferences(ZovaWidget.PREFS_NAME, MODE_PRIVATE)
                .edit().putString(ZovaWidget.KEY_PERSONA, name).apply();
            ZovaWidget.updateAllWidgets(activity);
        }

        @JavascriptInterface
        public void setLastSession(String info) {
            activity.getSharedPreferences(ZovaWidget.PREFS_NAME, MODE_PRIVATE)
                .edit().putString(ZovaWidget.KEY_SESSION, info).apply();
            ZovaWidget.updateAllWidgets(activity);
        }

        @JavascriptInterface
        public void setPersonaAvatar(String dataUrl) {
            android.content.SharedPreferences.Editor ed =
                activity.getSharedPreferences(ZovaWidget.PREFS_NAME, MODE_PRIVATE).edit();
            if (dataUrl == null || dataUrl.isEmpty()) {
                ed.putBoolean(ZovaWidget.KEY_HAS_AVATAR, false).apply();
                new java.io.File(activity.getFilesDir(), ZovaWidget.AVATAR_FILE).delete();
            } else {
                try {
                    String b64 = dataUrl.contains(",") ? dataUrl.substring(dataUrl.indexOf(',') + 1) : dataUrl;
                    byte[] bytes = android.util.Base64.decode(b64, android.util.Base64.DEFAULT);
                    android.graphics.Bitmap bmp = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                    if (bmp != null) {
                        android.graphics.Bitmap scaled = android.graphics.Bitmap.createScaledBitmap(bmp, 96, 96, true);
                        java.io.FileOutputStream fos = activity.openFileOutput(ZovaWidget.AVATAR_FILE, MODE_PRIVATE);
                        scaled.compress(android.graphics.Bitmap.CompressFormat.PNG, 90, fos);
                        fos.close();
                        ed.putBoolean(ZovaWidget.KEY_HAS_AVATAR, true).apply();
                    } else {
                        ed.putBoolean(ZovaWidget.KEY_HAS_AVATAR, false).apply();
                    }
                } catch (Exception e) {
                    ed.putBoolean(ZovaWidget.KEY_HAS_AVATAR, false).apply();
                }
            }
            ZovaWidget.updateAllWidgets(activity);
        }
    }
}
