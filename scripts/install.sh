TN=`date +"%s"`
SD="/tmp/fss-$TN"
mkdir $SD
svn checkout https://freebase-site.googlecode.com/svn/trunk/scripts $SD
$SD/sitedeploy.py setup
