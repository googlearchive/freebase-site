#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acreaebot/acreae/build
${SRC}/sitesetup.sh ~/acreaebot/acreae/build ~/acreaebot/acreae/build/freebase-site
cp ${SRC}/project.acreaebot.conf ${BASE}/config
${BASE}/acre distclean


