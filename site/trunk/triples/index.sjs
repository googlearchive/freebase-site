var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var f = mf.require("filters");
var h = mf.require("core", "helpers");
var datejs = mf.require("libraries", "date").Date;

var id = acre.request.params.id || acre.request.path_info;

var filters = f.get_filters(id);

var data = h.extend({
  id: id,
  // breadcrumb: queries.breadcrumb(id, options),
  topic: queries.topic(id, filters),
  // last_edit: queries.last_edit(id, options),
  names: queries.names(id, filters),
  aliases: queries.aliases(id, filters),
  articles: queries.articles(id, filters),
  keys: queries.keys(id, filters),
  outgoing: queries.outgoing(id, filters),
  incoming: queries.incoming(id, filters),
  typelinks: queries.typelinks(id, filters),
  filters: filters
});

mf.require("template", "renderer").render_page(data, mf.require("index_template"));
