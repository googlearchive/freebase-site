#!/bin/bash -x
BASE=~/fsbot/fs/build/acretrunk
cd $BASE
# die!
A_PID=`ps ax | grep 'fs/build/acretrunk/webapp' | grep -v grep | awk '{print $1}'`
if [ ! -z "$A_PID" ]; then
  echo "killing $A_PID"
  kill $A_PID
fi
