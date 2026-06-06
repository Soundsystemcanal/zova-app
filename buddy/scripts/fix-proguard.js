#!/usr/bin/env node
// Fixes deprecated proguard-android.txt in all Capacitor plugins
// Run automatically via postinstall

const fs = require('fs');
const path = require('path');

const files = [
    'node_modules/capacitor-secure-storage-plugin/android/build.gradle',
    'node_modules/@capacitor-community/text-to-speech/android/build.gradle',
];

let fixed = 0;
for (const file of files) {
    const full = path.join(__dirname, '..', file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes("'proguard-android.txt'")) {
        fs.writeFileSync(full, content.replace(
            /getDefaultProguardFile\('proguard-android\.txt'\)/g,
            "getDefaultProguardFile('proguard-android-optimize.txt')"
        ));
        console.log(`✅ Fixed: ${file}`);
        fixed++;
    }
}
if (fixed === 0) console.log('ℹ️  All proguard files already up to date.');
