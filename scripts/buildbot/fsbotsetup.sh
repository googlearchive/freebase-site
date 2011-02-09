#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/fsbot/fs/build
${SRC}/sitesetup.sh ~/fsbot/fs/build/acrebranch ~/fsbot/fs/build
cp ${SRC}/project.fsbot.conf ${BASE}/acrebranch/config

