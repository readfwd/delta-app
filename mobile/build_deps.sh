#!/bin/bash

set -e

SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )
APILEVEL="android-21"

cd "$SCRIPTPATH"
find platforms/android -type d \( -name ant-build -or -name ant-gen \) | xargs rm -r

cd "$SCRIPTPATH/platforms/android/CordovaLib/"
android update project --subprojects --path . --target $APILEVEL
ant release
cd "$SCRIPTPATH/platforms/android/google/play_licensing/library/"
android update project --subprojects --path . --target $APILEVEL
ant release
cd "$SCRIPTPATH/platforms/android/google/play_apk_expansion/zip_file"
android update project --subprojects --path . --target $APILEVEL
ant release
cd "$SCRIPTPATH/platforms/android/google/play_apk_expansion/downloader_library/"
android update project --subprojects --path . --target $APILEVEL
ant release
cd "$SCRIPTPATH/platforms/android/"
android update project --subprojects --path . --target $APILEVEL
