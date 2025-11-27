# PowerShell script to get SHA-1 certificate fingerprint for Google Sign In
# This script helps you get the SHA-1 fingerprint needed for Google Cloud Console

Write-Host "Getting SHA-1 fingerprint for Google Sign In..." -ForegroundColor Green
Write-Host ""

# Path to debug keystore
$keystorePath = "$PSScriptRoot\app\debug.keystore"
$keystorePassword = "android"
$keyAlias = "androiddebugkey"

if (Test-Path $keystorePath) {
    Write-Host "Found debug keystore at: $keystorePath" -ForegroundColor Yellow
    Write-Host ""
    
    # Get SHA-1
    Write-Host "SHA-1 Fingerprint:" -ForegroundColor Cyan
    $sha1 = keytool -list -v -keystore $keystorePath -alias $keyAlias -storepass $keystorePassword -keypass $keystorePassword 2>&1 | Select-String -Pattern "SHA1:" | ForEach-Object { $_.Line.Trim() }
    
    if ($sha1) {
        Write-Host $sha1 -ForegroundColor Green
        Write-Host ""
        Write-Host "Copy this SHA-1 value and add it to Google Cloud Console:" -ForegroundColor Yellow
        Write-Host "1. Go to https://console.cloud.google.com/" -ForegroundColor White
        Write-Host "2. Select your project" -ForegroundColor White
        Write-Host "3. Go to APIs & Services > Credentials" -ForegroundColor White
        Write-Host "4. Edit your OAuth 2.0 Client ID" -ForegroundColor White
        Write-Host "5. Add this SHA-1 to 'SHA certificate fingerprints'" -ForegroundColor White
    } else {
        Write-Host "Could not extract SHA-1. Make sure Java keytool is in your PATH." -ForegroundColor Red
    }
} else {
    Write-Host "Debug keystore not found at: $keystorePath" -ForegroundColor Red
    Write-Host "Creating debug keystore..." -ForegroundColor Yellow
    
    # Create debug keystore if it doesn't exist
    keytool -genkey -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $keystorePassword -keypass $keystorePassword -dname "CN=Android Debug, O=Android, C=US"
    
    if (Test-Path $keystorePath) {
        Write-Host "Debug keystore created successfully!" -ForegroundColor Green
        Write-Host "Run this script again to get SHA-1." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "For Release builds, you'll need to get SHA-1 from your release keystore." -ForegroundColor Cyan

