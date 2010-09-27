var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var h = mf.require("core", "helpers");

var id = acre.request.params.id || acre.request.path_info;
var domain = acre.request.params.d;
var type = acre.request.params.t;
var property = acre.request.params.p;

var limits = get_limits();

var options = {
  limit: limits.limit,
  domain: domain,
  type: type,
  property: property
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
var params = h.extend({}, acre.request.params);
if (limits.limit === queries.LIMIT) {
  delete params.limit;
}

var data = h.extend({
  id: id,
  topic: queries.topic(id, options),
  names: queries.names(id, options),
  keys: queries.keys(id, options),
  outgoing: queries.outgoing(id, options),
  incoming: queries.incoming(id, options),
  typelinks: queries.typelinks(id, options),
  params: params
}, limits);


mf.require("template", "renderer").render_page(data, mf.require("index_template"));





function get_limits() {
  // calculate limit, prev_limit, next_limit
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
  var prev_limit_url = null;
  if (prev_limit < queries.LIMIT) {
    prev_limit = null;
  };
  if (next_limit < queries.LIMIT2) {
    next_limit = queries.LIMIT2;
  }
  if (prev_limit) {
    var prev_limit_params = h.extend({}, acre.request.params, {limit:prev_limit});
    if (prev_limit === queries.LIMIT) {
      delete prev_limit_params.limit;
    }
    prev_limit_url = h.url_for("triples", null, prev_limit_params, id);
  }
  var next_limit = limit * 2;
  var next_limit_url = null;
  var next_limit_params = h.extend({}, acre.request.params, {limit:next_limit});
  if (next_limit === queries.LIMIT) {
    delete next_limit_params.limit;
  }
  next_limit_url = h.url_for("triples", null, next_limit_params, id);

  return {
    limit: limit,
    prev_limit: prev_limit,
    prev_limit_url: prev_limit_url,
    next_limit: next_limit,
    next_limit_url: next_limit_url
  };
};
