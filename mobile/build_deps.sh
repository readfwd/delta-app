#!/bin/bash

set -e

SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )

cd "$SCRIPTPATH/platforms/android/"
android update project --subprojects --path . --target "android-19"
cd "$SCRIPTPATH/platforms/android/CordovaLib/"
android update project --subprojects --path . --target "android-19"
ant debug
ant release

