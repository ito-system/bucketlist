const { withPodfile } = require('@expo/config-plugins');

/** Keep CocoaPods resource bundles compatible with Xcode 27's iOS 15 floor. */
module.exports = function withIosPodMinimumDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
    const marker = "# RevenueCat pods: inherit the app's minimum deployment target for Xcode 27.\n";
    if (contents.includes(marker)) return config;

    const block = `${marker}    app_minimum = installer.pods_project.build_configurations.first.build_settings['IPHONEOS_DEPLOYMENT_TARGET']\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |build_config|\n        pod_minimum = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']\n        next if pod_minimum.nil? || app_minimum.nil? || Gem::Version.new(pod_minimum) >= Gem::Version.new(app_minimum)\n\n        build_config.build_settings.delete('IPHONEOS_DEPLOYMENT_TARGET')\n      end\n    end\n`;

    const pattern = /react_native_post_install\([\s\S]*?\n\s*\)/;
    if (!pattern.test(contents)) {
      throw new Error('Could not find the React Native post_install block in Podfile.');
    }
    config.modResults.contents = contents.replace(pattern, (match) => `${match}\n${block}`);
    return config;
  });
};
