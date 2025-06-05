#!/bin/bash
NPM_VER_NUM="$CURR_VERSION-build.1$GITHUB_SHA_SHORT-prerelease" # lerna can't handle a string that starts with `0` so adding '1' before all strings

echo "NPM_VER_NUM=$NPM_VER_NUM" >> $GITHUB_ENV