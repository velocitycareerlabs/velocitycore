#!/bin/bash
VER_NUM="dev-$CURR_VERSION-build.1$GITHUB_SHA_SHORT" # Add '1' to stay consistent with NPM ver below
NPM_VER_NUM="$CURR_VERSION-dev-build.1$GITHUB_SHA_SHORT" # lerna can't handle a string that starts with `0` so adding '1' before all strings

echo "VER_NUM=$VER_NUM" >> $GITHUB_ENV
echo "NPM_VER_NUM=$NPM_VER_NUM" >> $GITHUB_ENV