#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acrebot/acre/build
#${BASE}/acre get-mysql-driver
${SRC}/sitesetup.sh ~/acrebot/acre/build ~/freebase-site
cp ${SRC}/project.acrebot.conf ${BASE}/config

