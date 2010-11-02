var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var f = mf.require("filters");
var h = mf.require("core", "helpers");
var datejs = mf.require("libraries", "date").Date;

var id = acre.request.params.id || acre.request.path_info;

var filters = f.get_filters(id);

var data = h.extend({
  id: id,
  topic: queries.topic(id, filters),
  prop_counts: queries.prop_counts(id, filters),
  names_aliases: queries.names_aliases(id, filters),
  keys: queries.keys(id, filters),
  outgoing: queries.outgoing(id, filters),
  incoming: queries.incoming(id, filters),
  typelinks: queries.typelinks(id, filters),
  attribution_links: queries.attribution_links(id, filters),
  filters: filters
});

mf.require("template", "renderer").render_page(data, mf.require("index_template"));
