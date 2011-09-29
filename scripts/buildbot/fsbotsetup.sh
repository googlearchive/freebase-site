#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/fsbot/fs/build/acretrunk
${SRC}/sitesetup.sh ${BASE} ~/fsbot/fs/build
cp ${SRC}/project.fsbot.conf ${BASE}/config
cp ${SRC}/web.default.xml ${BASE}/webapp/WEB-INF/web.default.xml


