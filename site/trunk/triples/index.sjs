var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var h = mf.require("core", "helpers");

var id = acre.request.params.id || acre.request.path_info;
var domain = acre.request.params.d;
var type = acre.request.params.t;
var property = acre.request.params.p;
// calculate limit, prev, next
var limit = queries.LIMIT;
if (acre.request.params.limit) {
  try {
    limit = parseInt(acre.request.params.limit);
    if (!limit || limit < queries.LIMIT) {
      limit = queries.LIMIT;
    }
  }
  catch(ex) {
    limit = queries.LIMIT;
  }
}
var prev_limit = limit / 2;
var next_limit = limit * 2;
if (prev_limit < queries.LIMIT) {
  prev_limit = null;
};
if (next_limit < queries.LIMIT2) {
  next_limit = queries.LIMIT2;
}
var prev_limit_url = null;
var next_limit_url = h.url_for("triples", null, h.extend(acre.request.params, {limit:next_limit}), id);
if (prev_limit) {
  prev_limit_url = h.url_for("triples", null, h.extend(acre.request.params, {limit:prev_limit}), id);
}

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
  typelinks: queries.typelinks(id, options),
  limit: limit,
  prev_limit: prev_limit,
  prev_limit_url: prev_limit_url,
  next_limit: next_limit,
  next_limit_url: next_limit_url
};

mf.require("template", "renderer").render_page(data, mf.require("index_template"));
