#! /bin/sh

# This is a hack to work-around the lack of directory support in the acre deploy system

# To setup the git repo

#  cd codemirror
#  git init .
#  git remote add origin http://github.com/marijnh/CodeMirror.git

# To update:
#  git pull origin master
#  svn status
#  ../build.sh
#  (and svn commit if all is well)

# Normalize the PARENT directory
cd `dirname $0`/..

# Copy all the JS files from CodeMirror's GitHub repo to a flat acre app
# and rename *.js --> *.js.js
# Note: the CSS files are not copied,
#       the site/codemirror*.css.css files are hand written
TMPDIR=/tmp/codemirrorjs
rm -rf $TMPDIR 2>/dev/null
mkdir $TMPDIR
cp third_party/codemirror/js/*.js $TMPDIR
rename s/js$/js.js/ $TMPDIR/*.js
cp $TMPDIR/*.js codemirror/

# show the changes
ls -lrt codemirror/
