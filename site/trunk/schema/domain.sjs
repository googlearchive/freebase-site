var mf = acre.require("MANIFEST").mf;
var api = acre.require("domain_api").api;
var service = mf.require("core", "service");
var queries = mf.require("queries");

try {
  // path_info may be a service call
  service.main(this, api);
}
catch (e if e instanceof service.ApiNotFoundError) {
  // if not found, path_info is a domain id
  main();
}

function main() {
  var domain_id = acre.request.params.id || acre.request.path_info;
  var data = {
    id: domain_id,
    domain: queries.domain(domain_id)
  };
  mf.require("template", "renderer").render_page(
    data,
    mf.require("domain_template")
  );
};
