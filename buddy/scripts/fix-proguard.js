#!/usr/bin/env node
// Fixes deprecated proguard-android.txt and missing namespace in Capacitor plugins
// Run automatically via postinstall

const fs = require('fs');
const path = require('path');

// Fix 1: deprecated proguard-android.txt
const proguardFiles = [
    'node_modules/capacitor-secure-storage-plugin/android/build.gradle',
    'node_modules/@capacitor-community/text-to-speech/android/build.gradle',
];

let fixed = 0;
for (const file of proguardFiles) {
    const full = path.join(__dirname, '..', file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes("'proguard-android.txt'")) {
        fs.writeFileSync(full, content.replace(
            /getDefaultProguardFile\('proguard-android\.txt'\)/g,
            "getDefaultProguardFile('proguard-android-optimize.txt')"
        ));
        console.log(`✅ Fixed proguard: ${file}`);
        fixed++;
    }
}

// Fix 2: missing namespace in @capacitor/http
const httpGradle = path.join(__dirname, '..', 'node_modules/@capacitor/http/android/build.gradle');
if (fs.existsSync(httpGradle)) {
    const content = fs.readFileSync(httpGradle, 'utf8');
    if (!content.includes('namespace')) {
        fs.writeFileSync(httpGradle, content.replace(
            /android \{/,
            'android {\n    namespace "com.getcapacitor.http.http"'
        ));
        console.log('✅ Fixed namespace: @capacitor/http');
        fixed++;
    }
}

if (fixed === 0) console.log('ℹ️  All gradle files already up to date.');
