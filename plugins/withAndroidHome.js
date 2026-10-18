const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");
module.exports = (config) =>
  withAndroidManifest(config, (mod) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(
      mod.modResults,
    );
    activity.$["android:launchMode"] = "singleTask";
    activity["intent-filter"] ??= [];
    if (
      !activity["intent-filter"].some((filter) =>
        filter.category?.some(
          (item) => item.$["android:name"] === "android.intent.category.HOME",
        ),
      )
    ) {
      activity["intent-filter"].push({
        action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
        category: [
          { $: { "android:name": "android.intent.category.HOME" } },
          { $: { "android:name": "android.intent.category.DEFAULT" } },
        ],
      });
    }
    return mod;
  });
