var mf = acre.require("MANIFEST").MF;
var api = acre.require("type_api").api;
var service = mf.require("core", "service");
var queries = mf.require("queries");

try {
  // path_info may be a service call
  service.main(this, api);
}
catch (e if e instanceof service.ApiNotFoundError) {
  main();
}

function main() {
  var type_id = acre.request.params.id || acre.request.path_info;
  var diagram = acre.request.params.view === "diagram";
  var data = {
    id: type_id,
    diagram: diagram,
    type: diagram ? queries.typediagram(type_id) : queries.type(type_id)
  };
  mf.require("template", "renderer").render_page(
    data,
    mf.require("type_template")
  );
};
