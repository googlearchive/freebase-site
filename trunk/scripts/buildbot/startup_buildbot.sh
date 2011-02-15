#!/bin/sh

/usr/local/bin/buildbot start /home/acrebbuser/buildbot
/usr/local/bin/buildslave start /home/acrebbuser/fsbot
/usr/local/bin/buildslave start /home/acrebbuser/acrebot
/usr/local/bin/buildslave start /home/acrebbuser/acreaebot
