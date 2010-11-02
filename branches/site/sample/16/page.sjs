var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var page = mf.require("page_template");

var queries = {
  "topic": freebase.mqlread({id: "/en/bob_dylan", name: null})
    .then(function(envelope) {return envelope.result;}),
  "greeting": "Hello"
};

mf.require("template", "renderer").render_page(queries, page);
