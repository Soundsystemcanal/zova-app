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
    private PowerManager.WakeLock convWakeLock; // acquis SEULEMENT pendant une conversation active
    private boolean serviceRunning = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // NB : pas de FLAG_KEEP_SCREEN_ON ni de WakeLock/ForegroundService ici.
        // Ils étaient permanents (drain batterie en veille) → désormais liés à la
        // conversation active via startConversationHold()/stopConversationHold(),
        // appelés par le JS dans requestWakeLock()/releaseWakeLock().

        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

        // Bridge JS→Android : mise à jour widget + lecture persona active
        getBridge().getWebView().addJavascriptInterface(new ZovaJSBridge(this), "ZovaBridge");

        // Tap widget → démarrer la conversation directement
        if (getIntent() != null && getIntent().getBooleanExtra("AUTO_START", false)) {
            triggerAutoStart(2500);
        }
    }

    // Maintien pendant une conversation : WakeLock CPU + service au premier plan
    // (réseau non throttlé) + écran allumé. Idempotent.
    void startConversationHold() {
        runOnUiThread(() -> {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            if (convWakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
                if (pm != null) convWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Zova::Conversation");
            }
            if (convWakeLock != null && !convWakeLock.isHeld()) {
                convWakeLock.acquire(4 * 60 * 60 * 1000L); // garde-fou : 4 h max
            }
            if (!serviceRunning) {
                try { startForegroundService(new Intent(this, ZovaForegroundService.class)); serviceRunning = true; } catch (Exception e) {}
            }
        });
    }

    void stopConversationHold() {
        runOnUiThread(() -> {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            if (convWakeLock != null && convWakeLock.isHeld()) {
                try { convWakeLock.release(); } catch (Exception e) {}
            }
            if (serviceRunning) {
                try { stopService(new Intent(this, ZovaForegroundService.class)); } catch (Exception e) {}
                serviceRunning = false;
            }
        });
    }

    // Filet de sécurité : si l'activité est détruite en pleine session, on libère.
    @Override
    public void onDestroy() {
        stopConversationHold();
        super.onDestroy();
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

        // Maintien pendant une conversation (WakeLock CPU + service réseau +
        // écran allumé). Appelés depuis requestWakeLock()/releaseWakeLock() en JS.
        @JavascriptInterface
        public void startConversationHold() { activity.startConversationHold(); }

        @JavascriptInterface
        public void stopConversationHold() { activity.stopConversationHold(); }

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
