#!/bin/sh -x
BASE=/home/acrebbuser/refinerybot/refinery/build
export ACRE_HOME=${BASE}/acretrunk
export APPENGINE_HOME=/opt/appengine
cd $BASE
# keystore (you must manually build this using /keystore if you find nothing in /keys
mkdir -p ${ACRE_HOME}/webapp/WEB-INF/appengine-generated
cp /home/acrebbuser/bbstuff/local_db.bin ${ACRE_HOME}/webapp/WEB-INF/appengine-generated/local_db.bin
# stop acre
ps ax | grep 'refinery/build/acretrunk/webapp' | grep -v grep | awk '{print $1}' | xargs kill
# link in code
SVN_HOME=${ACRE_HOME}/webapp/WEB-INF/scripts/googlecode/freebase-refinery/svn
rm -rf ${SVN_HOME}
mkdir -p ${SVN_HOME}
ln -s ${BASE}/trunk ${SVN_HOME}/trunk
ln -s ${BASE}/environments ${SVN_HOME}/environments

RUN_CMD="${BASE}/trunk/refinery.sh run"
nohup sh -c "exec ${RUN_CMD} >> acre.console.log 2>&1" >/dev/null &
sleep 20



