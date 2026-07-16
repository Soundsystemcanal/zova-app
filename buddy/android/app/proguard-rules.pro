# Add project specific ProGuard rules here.
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ── Pont JS ↔ Android : le JS appelle ces méthodes par leur nom exact.
# Sans ces règles, R8 les renomme/supprime → bridge cassé (audio, wakelock, widget).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.buddy.voiceapp.MainActivity$ZovaJSBridge { *; }

# ── Composants natifs référencés par l'AndroidManifest (Activity, Service, Widget)
-keep class com.buddy.voiceapp.MainActivity { *; }
-keep class com.buddy.voiceapp.ZovaForegroundService { *; }
-keep class com.buddy.voiceapp.ZovaWidget { *; }

# ── Capacitor : bridge natif + plugins chargés par réflexion
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin { @com.getcapacitor.PluginMethod <methods>; }

# Traces d'erreur lisibles (numéros de ligne) dans les rapports de crash
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
