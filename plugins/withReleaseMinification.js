const { withGradleProperties } = require("expo/config-plugins");

// react-native's own app/build.gradle reads this exact property name to
// decide `minifyEnabled` for the release build type (default: false, so R8
// never runs and no mapping.txt is produced — that's what Play Console's
// "no deobfuscation file" warning is about). With an Android App Bundle and
// AGP 4.1+ (this project is on 8.x), enabling it is the whole fix: R8's
// mapping is embedded straight into the .aab and Play pulls it from there
// automatically on upload — no separate mapping-file upload step.
const PROPERTY_KEY = "android.enableMinifyInReleaseBuilds";

function withReleaseMinification(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter((item) => item.key !== PROPERTY_KEY);
    config.modResults.push({ type: "property", key: PROPERTY_KEY, value: "true" });
    return config;
  });
}

module.exports = withReleaseMinification;
