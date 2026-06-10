package com.buddy.voiceapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.view.View;
import android.widget.RemoteViews;
import java.io.File;

/**
 * Widget Android 2×2 — tap démarre la conversation directement.
 * Affiche : avatar (photo ou lettre), nom persona, dernière session.
 */
public class ZovaWidget extends AppWidgetProvider {

    static final String PREFS_NAME    = "ZovaWidget";
    static final String KEY_PERSONA   = "persona_name";
    static final String KEY_SESSION   = "last_session";
    static final String KEY_HAS_AVATAR = "has_avatar";
    static final String AVATAR_FILE   = "widget_avatar.png";

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
        String personaName = prefs.getString(KEY_PERSONA, "Zova");
        String lastSession = prefs.getString(KEY_SESSION, "");
        boolean hasAvatar  = prefs.getBoolean(KEY_HAS_AVATAR, false);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_zova);

        // Avatar : photo ou lettre de fallback
        String avatarLetter = personaName.isEmpty() ? "Z" : String.valueOf(personaName.charAt(0)).toUpperCase();
        views.setTextViewText(R.id.widget_avatar, avatarLetter);

        boolean photoLoaded = false;
        if (hasAvatar) {
            File f = new File(context.getFilesDir(), AVATAR_FILE);
            if (f.exists()) {
                Bitmap bmp = BitmapFactory.decodeFile(f.getAbsolutePath());
                if (bmp != null) {
                    views.setImageViewBitmap(R.id.widget_avatar_img, bmp);
                    views.setViewVisibility(R.id.widget_avatar_img, View.VISIBLE);
                    views.setViewVisibility(R.id.widget_avatar, View.GONE);
                    photoLoaded = true;
                }
            }
        }
        if (!photoLoaded) {
            views.setViewVisibility(R.id.widget_avatar_img, View.GONE);
            views.setViewVisibility(R.id.widget_avatar, View.VISIBLE);
        }

        views.setTextViewText(R.id.widget_title, personaName);
        views.setTextViewText(R.id.widget_session, lastSession);

        // Intent AUTO_START=true → conversation démarre direct
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("AUTO_START", true);
        PendingIntent pi = PendingIntent.getActivity(
            context, widgetId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pi);
        views.setOnClickPendingIntent(R.id.widget_avatar_img, pi);
        views.setOnClickPendingIntent(R.id.widget_avatar, pi);

        mgr.updateAppWidget(widgetId, views);
    }
}
