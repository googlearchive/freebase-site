#! /bin/sh

# This is a hack to work-around the lack of directory support in the acre deploy system

# Normalize the PARENT directory
cd `dirname $0`/..

# Copy all the JS files from CodeMirror's GitHub repo to a flat acre app
cp -v third_party/codemirror/js/*.js codemirror/