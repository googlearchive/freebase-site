var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;
var h = mf.require("core", "helpers");


function get_article(o) {
  if (!o['/common/topic/article'] || o['/common/topic/article'].length === 0) {
    return o;
  }
  return freebase.get_blob(o['/common/topic/article'][0].id, "blurb")
    .then(function(response) {
      o.description = response.body;
      return o;
    });
};


function make_domain(d) {
  var instances = 0;
  var types = 0;
  for each (var t in d['/type/domain/types']) {
    types++;
    if ('/freebase/type_profile/instance_count' in t) {
      instances += t['/freebase/type_profile/instance_count'];
    }
  }
  d.instance_count = instances;
  d.type_count = types;
  d.date = h.parse_date(acre.freebase.date_from_iso(d.timestamp));
  return d;
};


var user_domains = function(user_id, order, dir) {
  order = order || "name";
  dir = dir || "asc";
  
  if (id === '/' || id.charAt(0) !== '/') {
    throw "invalid userid";
  }
  
  var q = mf.require("user-domains-query").query;
  q = acre.freebase.extend_query(q, { "creator" : user_id });
  
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(function(result) {
      var domains = result.map(function(d) {
        return make_domain(d);
      });
      return lsort(dedupe(domains), order, dir);
    },
    function() {
      return [];
    });
};


var all_domains = function(order, dir) {
  order = order || "name";
  dir = dir || "asc";
  
  var q = mf.require("index-query").query;
  
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(function(result) {
      var domains = result['/type/namespace/keys'].map(function(d) {
        return make_domain(d.namespace);
      });
      return lsort(dedupe(domains), order, dir);
    },
    function() {
      return [];
    });
};


var domain = function(id, order, dir) {
  if (id === '/' || id.charAt(0) !== '/') {
    throw "invalid ID";
  }
  
  order = order || "name";
  dir = dir || "asc";
  
  var q = mf.require("domain-query").query;
  q = acre.freebase.extend_query(q, {"id": id});
  
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(get_article)
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
      lsort(domain.subdomains, "id", "asc");
      
      var blurb_promises = [];
      domain.mediators = [];
      domain.types = domain.types.filter(function(t) {
        t.date = h.parse_date(acre.freebase.date_from_iso(t.timestamp));
        t.instance_count = t["/freebase/type_profile/instance_count"];
        t.mediator = t['/freebase/type_hints/mediator'];
        blurb_promises.push(get_article(t));
        
        if (t.mediator) {
          domain.mediators.push(t);
          return false;
        }
        return t;
      });
      
      domain.types = lsort(domain.types, order, dir);
      domain.mediators = lsort(domain.mediators, order, dir);
      
      return deferred.all(blurb_promises)
        .then(function() {
          return domain;
        });
    },
    function(error) {
      return null;
    });
};


var type = function(id, order, dir) {
  if (id === '/' || id.charAt(0) !== '/') {
    throw "invalid ID";
  }
  var q = mf.require("type-query").query;
  q = acre.freebase.extend_query(q, { "id" : id });
  
  return freebase.mqlread(q).
    then(function(envelope) {
      return envelope.result;
    })
    .then(get_article)
    .then(function(r) {
      if (!r) return null;
      
      var type = {
        id : r.id,
        name : r.name,
        domain : r.domain,
        mediator :  r['/freebase/type_hints/mediator'],
        published : r['/freebase/type_profile/published'],
        default_property : r.default_property,
        included_types : r["/freebase/type_hints/included_types"],
        key : r.key
      };
      
      type.desc = r.desc;
      type.instances = r['/freebase/type_profile/instance_count'] ? h.commafy(r['/freebase/type_profile/instance_count'].value) : null;
      
      type.properties = lsort(r.properties, "id", "asc");
      type.expected_by = lsort(r.expected_by, "id", "asc");

      type.inherited_properties = [];
      for each (var t in r['/freebase/type_hints/included_types']) {
        for each (var p in t.properties) {
          type.inherited_properties.push(p);
        }
      }
      type.inherited_properties = lsort(type.inherited_properties, "id", "asc");
      
      var q = [{
        "id": null,
        "name": null,
        "type": id,
        "*": null
      }];
      type.query_url = "http://www.freebase.com/app/queryeditor?autorun=true&q=" + encodeURIComponent(JSON.stringify(q));
      return type;
    },
    function(error) {
     return null;
    });
};


var property = function(id) {
  if (id === '/' || id.charAt(0) !== '/') {
    throw "invalid ID";
  }
  
  var q = mf.require("property-query").query;
  q = acre.freebase.extend_query(q, { "id" : id });
  
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(get_article)
    .then(null, function() {
      return null;
    });
};


function lsort(list, kind, dir) {
  var kinds = {
    "id" : {
      "key" : "id",
      "sort" : "id",
    },
    "types" : {
      "key" : "type_count",
      "sort" : "number"
    },
    "properties" : {
      "key" : "properties",
      "sort" : "length"
    },
    "instances" : {
      "key" : "instance_count",
      "sort" : "number"
    },
    "creation" : {
      "key" : "date",
      "sort" : "date"
    },
    "name" : {
      "key" : "name",
      "sort" : "text"
    }
  };
  
  function compare(a, b, kind) {
    var k = kinds[kind];
    
    switch (k.sort) {
      case "id" :
        var is_a_global = isGlobal(a[k.key]);
        var is_b_global = isGlobal(b[k.key]);
        if (is_a_global && !is_b_global) {
          return -1;
        } else if (is_b_global && !is_a_global) {
          return 1;
        } else {
          return a[k.key].localeCompare(b[k.key]);
        }
      case "number" :
        return  a[k.key] - b[k.key];
      case "date" :
        return datejs.Date.compare(a[k.key],b[k.key]);
      case "length" :
        return a[k.key].length - b[k.key].length;
      case "text" :
      default :
        return a[k.key].localeCompare(b[k.key]);
    }
  };
  
  return list.sort(function(a, b) {
    if (dir === "asc") {
      return compare(a, b, kind);
    } else {
      return compare(b, a, kind);
    }
  });
};

function dedupe(list) {
  var ids = {};
  list = list.filter(function(l) {
    if (ids[l.id]) return false;
    ids[l.id] = true;
    return l;          
  });
  return list;
};

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 && 
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}
