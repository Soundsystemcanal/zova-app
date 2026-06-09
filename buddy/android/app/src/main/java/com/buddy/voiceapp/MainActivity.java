package com.buddy.voiceapp;

import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fix D (existant) — écran allumé en permanence, plus fiable que navigator.wakeLock()
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Fix C — CPU WakeLock : empêche Android de throttler l'exécution JS/WebSocket
        // Timeout 8h — libéré automatiquement à la mort du processus ou après 8h
        // Requiert la permission WAKE_LOCK dans AndroidManifest
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm != null) {
            PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Zova::AppActive");
            wl.acquire(8 * 60 * 60 * 1000L); // max 8h, released on process death anyway
        }

        // Fix B — Foreground Service : signal MIUI que l'app est active → réseau non-throttlé
        // Affiche une notification discrète "Connexion active 🎙" pendant l'utilisation
        // Arrêt automatique via android:stopWithTask="true" dans le manifest
        startForegroundService(new Intent(this, ZovaForegroundService.class));
    }
}
