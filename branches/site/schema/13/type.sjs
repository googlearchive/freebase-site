var mf = acre.require("MANIFEST").MF;

var id = acre.request.params.id || acre.request.path_info;
var diagram = acre.request.params.view === "diagram";

var queries = mf.require("queries");

var data = {
  id: id,
  diagram: diagram,
  type : diagram ? queries.typediagram(id) : queries.type(id)
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("type_template")
);
