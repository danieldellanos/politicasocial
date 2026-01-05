#!/usr/bin/env node

/**
 * This hook configures Xcode project settings required for Swift compilation.
 * It ensures the bridging header is properly set up for the phonegap-plugin-push plugin.
 */

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    // Use regular require for npm modules
    let xcode;
    try {
        xcode = require('xcode');
    } catch (e) {
        console.log('xcode module not found, skipping Swift configuration');
        return;
    }

    if (!context.opts.platforms || context.opts.platforms.indexOf('ios') < 0) {
        return;
    }

    const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');

    if (!fs.existsSync(iosPlatformPath)) {
        console.log('iOS platform not found, skipping Swift configuration');
        return;
    }

    const files = fs.readdirSync(iosPlatformPath);
    const projFolder = files.find(function (file) {
        return file.match(/\.xcodeproj$/);
    });

    if (!projFolder) {
        console.log('Could not find Xcode project folder');
        return;
    }

    const projectPath = path.join(iosPlatformPath, projFolder, 'project.pbxproj');
    console.log('Configuring Xcode project at:', projectPath);

    try {
        const xcodeProject = xcode.project(projectPath);
        xcodeProject.parseSync();

        // Set Swift version and bridging header settings
        xcodeProject.addBuildProperty('SWIFT_VERSION', '5.0');
        xcodeProject.addBuildProperty('ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES', 'YES');
        xcodeProject.addBuildProperty('SWIFT_OBJC_BRIDGING_HEADER', '$(PROJECT_DIR)/$(PROJECT_NAME)/Bridging-Header.h');
        xcodeProject.addBuildProperty('SWIFT_OBJC_INTERFACE_HEADER_NAME', '$(SWIFT_MODULE_NAME)-Swift.h');

        // Don't override LD_RUNPATH_SEARCH_PATHS if it already exists
        const buildSettings = xcodeProject.pbxXCBuildConfigurationSection();
        let hasLdRunpathSearchPaths = false;

        for (const key in buildSettings) {
            const config = buildSettings[key];
            if (config.buildSettings && config.buildSettings.LD_RUNPATH_SEARCH_PATHS) {
                hasLdRunpathSearchPaths = true;
                break;
            }
        }

        if (!hasLdRunpathSearchPaths) {
            xcodeProject.addBuildProperty('LD_RUNPATH_SEARCH_PATHS', [
                '$(inherited)',
                '@executable_path/Frameworks'
            ]);
        }

        fs.writeFileSync(projectPath, xcodeProject.writeSync());
        console.log('Successfully configured Swift settings in Xcode project');
    } catch (error) {
        console.error('Error configuring Swift settings:', error);
    }
};
