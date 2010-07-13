var mf = acre.require("MANIFEST").MF;
//var queries = mf.require("queries");

var data = {
  "HACK":true
};


mf.require("template", "renderer").render_page(data,mf.require("index_template"));
