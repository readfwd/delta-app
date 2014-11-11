#!/bin/bash

set -e

SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )

cd "$SCRIPTPATH/platforms/android/CordovaLib/"
android update project --subprojects --path . --target "android-19"
ant release
cd "$SCRIPTPATH/platforms/android/google/play_licensing/library/"
android update project --subprojects --path . --target "android-19"
ant release
cd "$SCRIPTPATH/platforms/android/google/play_apk_expansion/downloader_library/"
android update project --subprojects --path . --target "android-19"
ant release
cd "$SCRIPTPATH/platforms/android/"
android update project --subprojects --path . --target "android-19"
