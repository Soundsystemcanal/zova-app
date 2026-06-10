package com.buddy.voiceapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Widget Android 2×2 — tap démarre la conversation directement.
 * Affiche : avatar lettre, nom persona, dernière session.
 */
public class ZovaWidget extends AppWidgetProvider {

    static final String PREFS_NAME    = "ZovaWidget";
    static final String KEY_PERSONA   = "persona_name";
    static final String KEY_SESSION   = "last_session";

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) updateWidget(context, mgr, id);
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, ZovaWidget.class));
        for (int id : ids) updateWidget(context, mgr, id);
    }

    static void updateWidget(Context context, AppWidgetManager mgr, int widgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String personaName  = prefs.getString(KEY_PERSONA, "Zova");
        String lastSession  = prefs.getString(KEY_SESSION, "");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_zova);

        String avatarLetter = personaName.isEmpty() ? "Z" : String.valueOf(personaName.charAt(0)).toUpperCase();
        views.setTextViewText(R.id.widget_avatar, avatarLetter);
        views.setTextViewText(R.id.widget_title, personaName);
        views.setTextViewText(R.id.widget_session, lastSession);
        views.setTextViewText(R.id.widget_subtitle, lastSession.isEmpty() ? "▶  Démarrer" : "▶  Démarrer");

        // Intent AUTO_START=true → conversation démarre direct
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("AUTO_START", true);
        PendingIntent pi = PendingIntent.getActivity(
            context, widgetId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pi);
        views.setOnClickPendingIntent(R.id.widget_avatar, pi);

        mgr.updateAppWidget(widgetId, views);
    }
}
