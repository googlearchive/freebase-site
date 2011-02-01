/*

testing: 5 requires to 1 versioned app

*/

var t1 = new Date();

console.log(acre.request.app_url);
var path = '.site.freebase.dev';
if (acre.request.app_url.indexOf('appspot')>0) { path= '.site.branches.svn.freebase-site.googlecode.dev'; }

for (var i = 1; i <= 5; i++) { 
    acre.require("//1.perf" + path + "/require_test_file" + i);
}
var t2 = new Date();
acre.write('require app path: ' + path + ' -- duration: ' + (t2-t1)/1000 + ' secs');



