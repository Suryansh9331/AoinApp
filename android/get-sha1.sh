#!/bin/bash
# Bash script to get SHA-1 certificate fingerprint for Google Sign In
# This script helps you get the SHA-1 fingerprint needed for Google Cloud Console

echo "Getting SHA-1 fingerprint for Google Sign In..."
echo ""

# Path to debug keystore
KEYSTORE_PATH="./app/debug.keystore"
KEYSTORE_PASSWORD="android"
KEY_ALIAS="androiddebugkey"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "Found debug keystore at: $KEYSTORE_PATH"
    echo ""
    
    # Get SHA-1
    echo "SHA-1 Fingerprint:"
    keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" 2>&1 | grep -i "SHA1:" | sed 's/^[[:space:]]*//'
    
    echo ""
    echo "Copy this SHA-1 value and add it to Google Cloud Console:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Select your project"
    echo "3. Go to APIs & Services > Credentials"
    echo "4. Edit your OAuth 2.0 Client ID"
    echo "5. Add this SHA-1 to 'SHA certificate fingerprints'"
else
    echo "Debug keystore not found at: $KEYSTORE_PATH"
    echo "Creating debug keystore..."
    
    # Create debug keystore if it doesn't exist
    keytool -genkey -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" -dname "CN=Android Debug, O=Android, C=US"
    
    if [ -f "$KEYSTORE_PATH" ]; then
        echo "Debug keystore created successfully!"
        echo "Run this script again to get SHA-1."
    fi
fi

echo ""
echo "For Release builds, you'll need to get SHA-1 from your release keystore."

