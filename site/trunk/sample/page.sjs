var mf = acre.require("MANIFEST").MF;
var controller = mf.require("/freebase/site/core/controller");
var page = mf.require("page_template");

controller.render_def(queries, page);
