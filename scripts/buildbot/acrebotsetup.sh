#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acrebot/acre/build
${SRC}/sitesetup.sh ~/acrebot/acre/build ~/acrebot/acre/build/freebase-site
cp ${SRC}/project.acrebot.conf ${BASE}/config

