#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/fsbot/fs/build
#${BASE}/acretrunk/acre get-mysql-driver
${SRC}/sitesetup.sh ~/fsbot/fs/build/acretrunk ~/fsbot/fs/build
cp ${SRC}/project.fsbot.conf ${BASE}/acretrunk/config

