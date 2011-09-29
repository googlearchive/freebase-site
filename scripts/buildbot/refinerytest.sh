#!/bin/sh -x
BASE=/home/acrebbuser/refinerybot/refinery/build
export ACRE_HOME=${BASE}/acretrunk
export APPENGINE_HOME=/opt/appengine
cd $BASE
${BASE}/trunk/refinery.sh test -n -j
