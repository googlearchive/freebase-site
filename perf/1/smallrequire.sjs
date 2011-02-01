/*

testing: 5 requires to 1 versioned app

*/

var t1 = new Date();

console.log(acre.request.app_url);
var path = '.site.freebase.dev';
if (acre.request.app_url.indexOf('appspot')>0) { path= '.site.branches.svn.freebase-site.googlecode.dev'; }

acre.require("//59.core" + path + "/helpers_format");
acre.require("//59.core" + path + "/helpers_markup");
acre.require("//59.core" + path + "/helpers_mql");
acre.require("//59.core" + path + "/helpers_url");
acre.require("//59.core" + path + "/helpers_util");
var t2 = new Date();
acre.write('require app path: ' + path + ' -- duration: ' + (t2-t1)/1000 + ' secs');



