var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");

var id = acre.request.params.id || acre.request.path_info;
var domain = acre.request.params.d;
var type = acre.request.params.t;
var property = acre.request.params.p;
var limit = acre.request.params.limit;

var options = {
  limit: limit
};
if (domain) {
  options.domain = domain;
}
else if (type) {
  options.type = type;
}
else if (property) {
  options.property = property;
}

var data = {
  topic: queries.topic(id, options),
  names: queries.names(id, options),
  keys: queries.keys(id, options),
  outgoing: queries.outgoing(id, options),
  incoming: queries.incoming(id, options),
  typelinks: queries.typelinks(id, options)
};

mf.require("template", "renderer").render_page(data, mf.require("index_template"));
