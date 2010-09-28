var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var f = mf.require("filters");
var h = mf.require("core", "helpers");
var datejs = mf.require("libraries", "date").Date;

var id = acre.request.params.id || acre.request.path_info;

var filters = f.get_filters();

var data = h.extend({
  id: id,
  // breadcrumb: queries.breadcrumb(id, options),
  topic: queries.topic(id, filters),
  // last_edit: queries.last_edit(id, options),
  names: queries.names(id, filters),
  keys: queries.keys(id, filters),
  outgoing: queries.outgoing(id, filters),
  incoming: queries.incoming(id, filters),
  typelinks: queries.typelinks(id, filters),
  filters: filters
});

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
