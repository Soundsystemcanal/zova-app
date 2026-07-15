package com.buddy.voiceapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Foreground Service — empêche MIUI/Android de throttler le réseau en mode économie d'énergie.
 * Démarré/arrêté par MainActivity.start/stopConversationHold() (uniquement pendant
 * une conversation active, plus au lancement de l'app → économie de batterie en veille).
 * La présence de ce service + notification indique à l'OS que l'app est "active"
 * et doit conserver ses connexions réseau (WebSocket IA).
 */
public class ZovaForegroundService extends Service {

    private static final String CHANNEL_ID = "zova_active_channel";
    private static final int    NOTIF_ID   = 1001;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            startForeground(NOTIF_ID, buildNotification());
        } catch (SecurityException e) {
            // RECORD_AUDIO not yet granted (fresh install on Android 14+) — stop gracefully
            stopSelf();
            return START_NOT_STICKY;
        }
        // NON sticky : le cycle de vie est piloté explicitement par le JS
        // (start/stop hold). Pas de redémarrage auto après stopService().
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        stopForeground(STOP_FOREGROUND_REMOVE); // retire la notification
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ── Notification canal (obligatoire Android 8+) ───────────────────────
    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Zova — Connexion active",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Maintient la connexion pendant une conversation vocale");
        channel.setShowBadge(false);
        channel.enableLights(false);
        channel.enableVibration(false);
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) nm.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            this, 0, openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Zova")
            .setContentText("Connexion active 🎙")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentIntent(pi)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }
}
