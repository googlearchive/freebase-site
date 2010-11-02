var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 &&
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}

function fix_id(o) {
//  if ("key" in o && o.key.length >  0) {
//    var v = o.key[o.key.length - 1];
//    o.id = v.namespace + '/' + v.value;
//  }
  return o;
}

/*
    Returns a query string for provided property
*/
function build_query_url(type_id, prop_id) {
  var q = {
    id: null,
    name: null,
    type: type_id
  };
  q[prop_id || "*"] = [];
  q = [q];
  return h.freebase_url("/app/queryeditor", {autorun: true, q: JSON.stringify(q)});
};


function lsort(list, kind, dir) {
  var kinds = {
    "id" : {
      "key" : "id",
      "sort" : "id"
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

function kind_of_domain (d){
   if (d['schema']['domain']['id'].indexOf("/user/") == 0){
       return 'user';
   }

   if (d['schema']['domain']['id'].indexOf("/base/") == 0){
       return 'base';
   }

   return 'commons';
}

function compare_type(a,b){
   var aval = kind_of_domain(a);
   var bval = kind_of_domain(b);

   if (aval < bval){
       return -1;
   }

   if (bval < aval){
       return 1;
   }

   return 0;
}

function sort_by_id(a,b) {
  return b.id < a.id;
};

function sort_by_name(a,b) {
  return (a.name || "").toLowerCase() > (b.name || "").toLowerCase();
};

function generate_key(name) {
  var key = h.trim(name).toLowerCase();
  key = key.replace(/[^a-z0-9]/g, '_');    // remove all non-alphanumeric
  key = key.replace(/\_\_+/g, '_');        // replace __+ with _
  key = key.replace(/[^a-z0-9]+$/, '');    // strip ending non-alphanumeric
  key = key.replace(/^[^a-z]+/, '');       // strip beginning non-alpha
  return key;
};

function generate_type_key(name) {
  return generate_key(name);
};
