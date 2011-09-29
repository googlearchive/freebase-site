#!/bin/bash -x
BASE=~/fsbot/fs/build/acretrunk
cd $BASE
# die!
ps ax | grep 'fs/build/acretrunk/webapp' | grep -v grep | awk '{print $1}' | xargs kill
RUN_CMD="./acre -v $1 -c fsbot appengine-run"
mkdir -p _logs
mkdir -p _data/acre
nohup sh -c "exec ${RUN_CMD} >> acre.console.log 2>&1" >/dev/null &
sleep 20
