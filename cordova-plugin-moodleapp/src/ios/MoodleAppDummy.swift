// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Foundation

/**
 * Dummy Swift file to force Xcode to generate the bridging header (Moodle-Swift.h)
 * This is required for the phonegap-plugin-push to compile correctly.
 */
@objc class MoodleAppDummy: NSObject {
    
    @objc static func initialize() {
        // This is intentionally empty
    }
}
