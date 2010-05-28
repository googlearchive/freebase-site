
var mf = acre.require("MANIFEST").MF;
var page_options = {};

var t = acre.require("/freebase/site/core/template", mf.version["/freebase/site/core"]);
var index = acre.require("index");

console.log("index this", index);

acre.write(acre.markup.bless(acre.markup.stringify(t.page(index, page_options))));
