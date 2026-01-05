#!/usr/bin/env node

/**
 * This hook configures Xcode project settings required for Swift compilation.
 * It ensures the bridging header is properly set up for the phonegap-plugin-push plugin.
 */

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const xcode = context.requireCordovaModule('xcode');
    const Q = context.requireCordovaModule('q');
    const deferral = new Q.defer();

    if (context.opts.platforms.indexOf('ios') < 0) {
        return;
    }

    const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
    
    fs.readdir(iosPlatformPath, function (err, data) {
        if (err) {
            console.error('Error reading iOS platform directory:', err);
            deferral.reject();
            return;
        }

        const projFolder = data.filter(function (file) {
            return file.match(/\.xcodeproj$/);
        })[0];

        if (!projFolder) {
            console.error('Could not find Xcode project folder');
            deferral.reject();
            return;
        }

        const projectPath = path.join(iosPlatformPath, projFolder, 'project.pbxproj');
        console.log('Configuring Xcode project at:', projectPath);

        const xcodeProject = xcode.project(projectPath);

        xcodeProject.parseSync();

        // Set Swift version and bridging header settings
        xcodeProject.addBuildProperty('SWIFT_VERSION', '5.0');
        xcodeProject.addBuildProperty('ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES', 'YES');
        xcodeProject.addBuildProperty('SWIFT_OBJC_BRIDGING_HEADER', '$(PROJECT_DIR)/$(PROJECT_NAME)/Bridging-Header.h');
        xcodeProject.addBuildProperty('SWIFT_OBJC_INTERFACE_HEADER_NAME', '$(SWIFT_MODULE_NAME)-Swift.h');

        fs.writeFileSync(projectPath, xcodeProject.writeSync());
        console.log('Successfully configured Swift settings in Xcode project');

        deferral.resolve();
    });

    return deferral.promise;
};
