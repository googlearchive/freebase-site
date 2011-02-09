#!/bin/bash -x

# this script sets up your acre installation to 
# run freebase site and site tests
# it takes two args for the acre and freebase-site paths
# ./sitesetup.sh ~/acrebot/acre/build ~/acrebot/acre/build/freebase-site


ACREBASE="$1"
FSBASE="$2"

WEBPATH=${ACREBASE}/webapp/WEB-INF/scripts/googlecode/freebase-site/svn

rm -f ${WEBPATH}/trunk
rm -f ${WEBPATH}/environments
rm -f ${ACREBASE}/webapp/META-INF/ots.www.conf.in

mkdir -p $WEBPATH
ln -s ${FSBASE}/trunk ${WEBPATH}/trunk
ln -s ${FSBASE}/environments ${WEBPATH}/environments
cp ${FSBASE}/trunk/config/ots.www.conf.in ${ACREBASE}/webapp/META-INF/ots.www.conf.in

