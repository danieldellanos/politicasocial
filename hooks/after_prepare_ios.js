#!/usr/bin/env node

/**
 * This hook fixes CocoaPods configuration issues after prepare.
 */

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
    const podfilePath = path.join(iosPlatformPath, 'Podfile');

    if (!fs.existsSync(podfilePath)) {
        console.log('Podfile not found, skipping CocoaPods configuration');
        return;
    }

    console.log('Configuring Podfile to fix CocoaPods warnings');

    try {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Add warning suppression if not already present
        if (!podfileContent.includes('warn_for_unused_master_specs_repo')) {
            // Add at the beginning of the file, after platform definition
            const platformRegex = /(platform\s+:ios[^\n]*\n)/;
            if (platformRegex.test(podfileContent)) {
                podfileContent = podfileContent.replace(
                    platformRegex,
                    '$1\n# Suppress CocoaPods master specs repo warning\ninstall! \'cocoapods\', :warn_for_unused_master_specs_repo => false\n'
                );
            }
        }

        // Add post_install hook to fix LD_RUNPATH_SEARCH_PATHS if not present
        if (!podfileContent.includes('post_install')) {
            const postInstallHook = `

# Post install hook to fix build settings
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Don't override LD_RUNPATH_SEARCH_PATHS
      config.build_settings.delete('LD_RUNPATH_SEARCH_PATHS')
    end
  end
end
`;
            podfileContent += postInstallHook;
        }

        fs.writeFileSync(podfilePath, podfileContent, 'utf8');
        console.log('Successfully configured Podfile');
    } catch (error) {
        console.error('Error configuring Podfile:', error);
    }
};
