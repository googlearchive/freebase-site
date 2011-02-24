#!/bin/bash -x
BASE=~/acreaebot/acreae/build
cd $BASE
# die!
ps ax | grep 'acreae/build/webapp' | grep -v grep | awk '{print $1}' | xargs kill
RUN_CMD="./acre -c acreaebot appengine-run"
mkdir -p _logs
mkdir -p _data/acre
nohup sh -c "exec ${RUN_CMD} >> _logs/acre.console.log 2>&1" >/dev/null &
sleep 10
A_PID=`ps ax | grep 'acreae/build/webapp' | grep -v grep | awk '{print $1}'`
ACRE_PID="_data/acre/acre.pid"
echo ${A_PID} > ${ACRE_PID}
#./acre -c acreaebot appengine-prepare-tests
sleep 10
