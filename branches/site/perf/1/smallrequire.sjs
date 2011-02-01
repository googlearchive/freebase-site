/*

testing: 5 requires to 1 versioned app

*/

var t1 = new Date();

acre.require("//59.core.site.freebase.dev/helpers_format");
acre.require("//59.core.site.freebase.dev/helpers_markup");
acre.require("//59.core.site.freebase.dev/helpers_mql");
acre.require("//59.core.site.freebase.dev/helpers_url");
acre.require("//59.core.site.freebase.dev/helpers_util");
var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');



