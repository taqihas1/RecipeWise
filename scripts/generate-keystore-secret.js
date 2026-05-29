const fs = require('fs');
const path = require('path');

const keystorePath = path.join(__dirname, '..', 'recipewise-release.keystore');

if (!fs.existsSync(keystorePath)) {
  console.error('❌ Keystore not found at:', keystorePath);
  process.exit(1);
}

const keystoreBase64 = fs.readFileSync(keystorePath).toString('base64');

console.log('✅ Keystore Base64 encoded successfully!');
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  ADD THIS TO GITHUB SECRETS (Settings → Secrets)');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('Secret Name: ANDROID_KEYSTORE_BASE64');
console.log('');
console.log('Value (copy everything below):');
console.log('───────────────────────────────────────────────────────');
console.log(keystoreBase64);
console.log('───────────────────────────────────────────────────────');
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  ALSO ADD THESE SECRETS:');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('Secret Name: ANDROID_KEYSTORE_PASSWORD');
console.log('Value:      recipewise123');
console.log('');
console.log('Secret Name: ANDROID_KEY_ALIAS');
console.log('Value:      recipewise-key');
console.log('');
console.log('Secret Name: ANDROID_KEY_PASSWORD');
console.log('Value:      recipewise123');
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  IMPORTANT: Keep the keystore file safe!');
console.log('  If you lose it, you cannot update your app on Google Play!');
console.log('═══════════════════════════════════════════════════════');
