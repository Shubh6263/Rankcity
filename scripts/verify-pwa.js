const fs = require('fs');
const path = require('path');

let errors = [];
let passed = 0;

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error('❌ FAIL:', message);
  } else {
    passed++;
    console.log('✅ PASS:', message);
  }
}

console.log('=== PWA Verification Test Suite ===\n');

// 1. Manifest JSON tests
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(true, 'public/manifest.json parses as valid JSON');
} catch (e) {
  assert(false, 'public/manifest.json failed to parse: ' + e.message);
}

if (manifest) {
  assert(manifest.name && manifest.name.length > 0, `Manifest has name: "${manifest.name}"`);
  assert(manifest.short_name && manifest.short_name.length > 0, `Manifest has short_name: "${manifest.short_name}"`);
  assert(manifest.start_url, `Manifest has start_url: "${manifest.start_url}"`);
  assert(manifest.display === 'standalone', `Manifest display is standalone: "${manifest.display}"`);
  assert(manifest.theme_color === '#2563EB', `Manifest theme_color is #2563EB`);
  assert(manifest.background_color === '#FFFFFF', `Manifest background_color is #FFFFFF`);
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 8, `Manifest defines ${manifest.icons?.length} icons`);

  // Verify all icon paths exist
  for (const icon of manifest.icons || []) {
    const iconFilePath = path.join(__dirname, '..', 'public', icon.src.replace(/^\//, ''));
    const exists = fs.existsSync(iconFilePath);
    assert(exists, `Icon exists on disk: ${icon.src}`);

    if (exists && icon.type === 'image/png' && icon.sizes && icon.sizes !== 'any') {
      const [w, h] = icon.sizes.split('x').map(Number);
      const buf = fs.readFileSync(iconFilePath);
      if (buf.length >= 24) {
        const fileW = buf.readUInt32BE(16);
        const fileH = buf.readUInt32BE(20);
        assert(fileW === w && fileH === h, `Icon ${icon.src} dimensions match ${w}x${h} (got ${fileW}x${fileH})`);
      }
    }
  }

  // Check maskable icons
  const maskableIcons = (manifest.icons || []).filter((i) => i.purpose && i.purpose.includes('maskable'));
  assert(maskableIcons.length >= 2, `Manifest has at least 2 maskable icons (found ${maskableIcons.length})`);

  // Check shortcuts
  assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 2, `Manifest defines ${manifest.shortcuts?.length} shortcuts`);

  // Check screenshots aspect ratio compliance
  for (const s of manifest.screenshots || []) {
    const [w, h] = s.sizes.split('x').map(Number);
    if (s.form_factor === 'narrow') {
      assert(h >= w, `Narrow screenshot ${s.src} must have height >= width (got ${w}x${h})`);
    } else if (s.form_factor === 'wide') {
      assert(w >= h, `Wide screenshot ${s.src} must have width >= height (got ${w}x${h})`);
    }
  }
}

// 2. Webmanifest file
const webmanifestPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest');
assert(fs.existsSync(webmanifestPath), 'public/manifest.webmanifest exists');

// 3. Service Worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');

if (fs.existsSync(swPath)) {
  const swCode = fs.readFileSync(swPath, 'utf8');
  assert(swCode.includes('STATIC_CACHE'), 'sw.js defines STATIC_CACHE');
  assert(swCode.includes('RUNTIME_CACHE'), 'sw.js defines RUNTIME_CACHE');
  assert(swCode.includes('IMAGE_CACHE'), 'sw.js defines IMAGE_CACHE');
  assert(swCode.includes('addEventListener(\'install\''), 'sw.js handles install event');
  assert(swCode.includes('addEventListener(\'activate\''), 'sw.js handles activate event');
  assert(swCode.includes('addEventListener(\'fetch\''), 'sw.js handles fetch event');
  assert(swCode.includes('/offline'), 'sw.js pre-caches /offline');
  assert(swCode.includes('SKIP_WAITING'), 'sw.js supports SKIP_WAITING message');
  assert(swCode.includes('ignoreSearch: true'), 'sw.js supports ignoreSearch query fallback');
  assert(swCode.includes('isRscRequest'), 'sw.js supports Next.js App Router RSC client navigations');
  assert(swCode.includes('isSensitiveApi'), 'sw.js prevents sensitive API leaks in cache');
}

// 4. Apple Touch Icon & Favicons
assert(fs.existsSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png')), 'public/apple-touch-icon.png exists');
assert(fs.existsSync(path.join(__dirname, '..', 'public', 'favicon.svg')), 'public/favicon.svg exists');
assert(fs.existsSync(path.join(__dirname, '..', 'public', 'favicon.ico')), 'public/favicon.ico exists');

// 5. Offline Fallback Page
const offlinePagePath = path.join(__dirname, '..', 'app', 'offline', 'page.tsx');
assert(fs.existsSync(offlinePagePath), 'app/offline/page.tsx exists');

// 6. PWA React Components
assert(fs.existsSync(path.join(__dirname, '..', 'lib', 'pwa', 'context.tsx')), 'lib/pwa/context.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'PwaRoot.tsx')), 'components/pwa/PwaRoot.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'PwaInstallBanner.tsx')), 'components/pwa/PwaInstallBanner.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'OfflineStatusToast.tsx')), 'components/pwa/OfflineStatusToast.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'UpdatePromptToast.tsx')), 'components/pwa/UpdatePromptToast.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'IosInstallGuideModal.tsx')), 'components/pwa/IosInstallGuideModal.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'InstallAppButton.tsx')), 'components/pwa/InstallAppButton.tsx exists');
assert(fs.existsSync(path.join(__dirname, '..', 'components', 'pwa', 'SplashScreen.tsx')), 'components/pwa/SplashScreen.tsx exists');

// Verify context and component robustness
const contextCode = fs.readFileSync(path.join(__dirname, '..', 'lib', 'pwa', 'context.tsx'), 'utf8');
assert(contextCode.includes('document.readyState === \'complete\''), 'context.tsx handles load event race condition');
assert(contextCode.includes('matchMedia(\'(display-mode: standalone)\')'), 'context.tsx checks standalone display-mode');

const iosModalCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'pwa', 'IosInstallGuideModal.tsx'), 'utf8');
assert(iosModalCode.includes('Escape'), 'IosInstallGuideModal handles Escape key');

const updateToastCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'pwa', 'UpdatePromptToast.tsx'), 'utf8');
assert(updateToastCode.includes('dismissUpdateToast'), 'UpdatePromptToast allows dismissing the toast');

// 7. Check Root Layout
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
const layoutCode = fs.readFileSync(layoutPath, 'utf8');
assert(layoutCode.includes('manifest: \'/manifest.json\''), 'layout.tsx defines manifest in metadata');
assert(layoutCode.includes('appleWebApp:'), 'layout.tsx defines appleWebApp in metadata');
assert(layoutCode.includes('PwaRoot'), 'layout.tsx wraps tree with PwaRoot');
assert(layoutCode.includes('apple-mobile-web-app-capable'), 'layout.tsx defines apple-mobile-web-app-capable in head');

// 8. Check next.config.ts headers
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
const nextConfigCode = fs.readFileSync(nextConfigPath, 'utf8');
assert(nextConfigCode.includes('/sw.js'), 'next.config.ts configures headers for /sw.js');
assert(nextConfigCode.includes('Service-Worker-Allowed'), 'next.config.ts configures Service-Worker-Allowed header');
assert(nextConfigCode.includes('/icons/:path*'), 'next.config.ts configures icon caching headers');

console.log(`\n========================================`);
console.log(`Results: ${passed} PASSED, ${errors.length} FAILED`);
console.log(`========================================`);

if (errors.length > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PWA CHECKS PASSED PERFECTLY!');
}
