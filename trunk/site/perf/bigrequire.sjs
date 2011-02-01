/*

testing: 10 requires to 1 versioned app

*/

var t1 = new Date();

var suffix = '.site.freebase.dev';
if (acre.request.app_url.indexOf('appspot')>0) { suffix= '.site.branches.svn.freebase-site.googlecode.dev'; }

for (var i = 1; i <= 10; i++) { 
    acre.require("//1.perf" + suffix + "/require_test_file" + i);
}
var t2 = new Date();
acre.write('require app suffix: ' + suffix + ' -- duration: ' + (t2-t1)/1000 + ' secs');



