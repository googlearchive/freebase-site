var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;
var h = mf.require("core", "helpers");
var utils = mf.require("util");


var domain = function(id, order, dir) {
  if (id === '' || id.charAt(0) !== '/') {
    throw "invalid ID";
  }
  
  var q = mf.require("domain-query").query;
  q = acre.freebase.extend_query(q, {"id": id});
  
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(function(domain) {
      if (!domain['/common/topic/article'] || domain['/common/topic/article'].length === 0) {
        return domain;
      }
      return freebase.get_blob(domain['/common/topic/article'][0].id)
        .then(function(response) {
          domain.desc = response.body;
          return domain;
        });
    })
    .then(function(domain) {
      domain.subdomains = domain['/type/namespace/keys'].map(function(v) {
        var d = v.namespace;
        var types = 0;
        var instances = 0;
        for each (var t in d.types) {
          types++;
          if ('/freebase/type_profile/instance_count' in t) {
            instances += t['/freebase/type_profile/instance_count'];
          }
        }
       return d;
      });
      delete domain['/type/namespace/keys'];
      utils.sort(domain.subdomains, "id", "asc");
      
      domain.mediators = [];
      domain.types = domain.types.map(function(t) {
        t.date = h.parse_date(acre.freebase.date_from_iso(t.timestamp));
        t.instance_count = t["/freebase/type_profile/instance_count"];
        t.mediator = t['/freebase/type_hints/mediator'];
        if (t.mediator) {
          domain.mediators.push(t);
        }
        return t;
      });
      
      utils.sort(domain.types, order, dir);
      utils.sort(domain.mediators, order, dir);
      return domain;
    },
    function(error) {
      return null
    });

    /*
    try {
      var graph = mf.require('schemaviz' ,'graph');
      var gv = graph.graphviz(graph.dot(result.id, acre.request.params));
    } catch (e) {
      var gv = { imageurl : null };
    }
    */
};


