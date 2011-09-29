#!/bin/bash -x
BASE=~/acreaebot/acreae/build
cd $BASE
# die!
A_PID=`ps ax | grep 'acreae/build/webapp' | grep -v grep | awk '{print $1}'`
if [ ! -z "$A_PID" ]; then
  echo "killing $A_PID"
  kill $A_PID
fi
