/*

testing: 10 requires across 3 versioned apps

*/

var t1 = new Date();

acre.require("//59.core.site.freebase.dev/helpers_format");
acre.require("//59.core.site.freebase.dev/helpers_markup");
acre.require("//59.core.site.freebase.dev/helpers_mql");
acre.require("//59.core.site.freebase.dev/helpers_url");
acre.require("//59.core.site.freebase.dev/helpers_util");

acre.require("//59.promise.site.freebase.dev/apis");
acre.require("//59.promise.site.freebase.dev/deferred");

acre.require("//59.appeditor-services.site.freebase.dev/get_app");
acre.require("//59.appeditor-services.site.freebase.dev/get_file");
acre.require("//59.appeditor-services.site.freebase.dev/lib_appeditor_service");

var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');

