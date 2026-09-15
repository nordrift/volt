const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");
// Not a declared dependency: it's expo-splash-screen's own dependency,
// already on disk wherever that package is (i.e. everywhere this plugin
// runs — local prebuild or EAS Build). Reused rather than re-declared so
// this stays consistent with how expo-splash-screen resizes its own icon
// per density, instead of hand-rolling a second resizing approach.
const { generateImageAsync } = require("@expo/image-utils");

// expo-splash-screen's own config plugin has no windowSplashScreenBrandingImage
// option, so this fills that one gap by hand. It deliberately doesn't touch
// anything expo-splash-screen already owns (the icon, the background colour,
// the base values/styles.xml Theme.App.SplashScreen) — it only adds a
// values-v31 override of that same style name, which is how Android lets a
// single style differ by API level: Android picks exactly one definition per
// resource name based on the device's API level, it does not merge items
// across values/ and values-v31/ for the same style. So the v31 version below
// has to repeat every item the base style sets (same fixed resource names
// expo-splash-screen's plugin always writes: @drawable/splashscreen_logo,
// @color/splashscreen_background, @style/AppTheme) or those would silently
// vanish on Android 12+ the moment this file exists. windowSplashScreenBrandingImage
// itself is a real API 31 framework attribute with no pre-31 equivalent, so it
// only belongs in this v31-qualified file, never in the base styles.xml.

const STYLE_NAME = "Theme.App.SplashScreen";
const STYLE_PARENT = "Theme.SplashScreen";
const BRANDING_DRAWABLE_NAME = "splash_branding";

// Same source file for both themes — the drawable-night-* copies are
// regenerated from it too, purely so a future re-export that does diverge
// per theme only has to change this constant.
const SOURCE_IMAGES = {
  light: path.join("assets", "images", "splash_branding.png"),
  dark: path.join("assets", "images", "splash_branding.png"),
};

// Android's hard cap for windowSplashScreenBrandingImage is 80dp tall.
// Height drives the box per density bucket; width follows the source's own
// aspect ratio so nothing stretches. Real per-bucket resizing (not one image
// reused everywhere) so the mark comes out the same physical size on every
// device instead of shrinking on denser screens — see the note at the call
// site for why that matters.
const MAX_HEIGHT_DP = 80;
const SOURCE_ASPECT_RATIO = 218 / 82;
const DENSITY_MULTIPLIERS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

function themesV31Xml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="${STYLE_NAME}" parent="${STYLE_PARENT}">
        <item name="android:windowSplashScreenBackground">@color/splashscreen_background</item>
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/splashscreen_logo</item>
        <item name="android:windowSplashScreenBrandingImage">@drawable/${BRANDING_DRAWABLE_NAME}</item>
        <item name="android:windowSplashScreenBehavior">icon_preferred</item>
        <item name="postSplashScreenTheme">@style/AppTheme</item>
    </style>
</resources>
`;
}

async function writeDensityCopies({ projectRoot, resDir, srcRelativePath, folderPrefix }) {
  const src = path.join(projectRoot, srcRelativePath);
  if (!fs.existsSync(src)) {
    throw new Error(`withSplashBranding: missing source image at ${src}`);
  }

  await Promise.all(
    Object.entries(DENSITY_MULTIPLIERS).map(async ([density, multiplier]) => {
      const height = Math.round(MAX_HEIGHT_DP * multiplier);
      const width = Math.round(height * SOURCE_ASPECT_RATIO);
      const { source } = await generateImageAsync(
        { projectRoot, cacheType: "splash-branding" },
        { src, resizeMode: "contain", width, height },
      );
      const destFolder = path.join(resDir, `${folderPrefix}-${density}`);
      fs.mkdirSync(destFolder, { recursive: true });
      fs.writeFileSync(path.join(destFolder, `${BRANDING_DRAWABLE_NAME}.png`), source);
    }),
  );
}

function withSplashBranding(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const { projectRoot, platformProjectRoot } = config.modRequest;
      const resDir = path.join(platformProjectRoot, "app", "src", "main", "res");

      await writeDensityCopies({
        projectRoot,
        resDir,
        srcRelativePath: SOURCE_IMAGES.light,
        folderPrefix: "drawable",
      });
      await writeDensityCopies({
        projectRoot,
        resDir,
        srcRelativePath: SOURCE_IMAGES.dark,
        folderPrefix: "drawable-night",
      });

      const v31Dir = path.join(resDir, "values-v31");
      fs.mkdirSync(v31Dir, { recursive: true });
      fs.writeFileSync(path.join(v31Dir, "themes.xml"), themesV31Xml());

      return config;
    },
  ]);
}

module.exports = withSplashBranding;
