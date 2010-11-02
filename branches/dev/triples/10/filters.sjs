var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var datejs = mf.require("libraries", "date").Date;
var validators = mf.require("validator", "validators");

var LIMIT = 100;
var LIMIT2 = LIMIT*2;

var TIMESTAMPS = {
 "today": function() {return datejs.today();},
 "yesterday" : function() {return datejs.today().addDays(-1);},
 "this week" : function() {return datejs.today().moveToDayOfWeek(1, -1);},
 "this month" : function() {return datejs.today().moveToFirstDayOfMonth();},
 "this year" : function() {
   var t = datejs.today();
   t.set({day:1,month:0,year:t.getFullYear()});
   return t;
 }
};

var scope = this;

function get_filters(id, args) {
  args = h.extend({}, args);
  var filters = {id: id};
  ["limit", "timestamp", "creator", "as_of_time", "history"].forEach(function(k) {
    filters[k] = scope["get_" + k](args[k]);
  });
  ["domain", "type", "property"].every(function(k) {
    if (args[k]) {
      filters[k] = validators.MqlId(args[k]);
      return false;
    }
    return true;
  });
  return filters;
};

function get_history(history) {
  return validators.StringBool(history, {if_empty:null,if_invalid:null});
};

function get_creator(creator) {
  if (creator) {
    if (h.is_array(creator)) {
      var users = [];
      creator.forEach(function(user) {
        user = validators.MqlId(user, {if_empty:null});
        if (user) {
          users.push(user);
        }
      });
      if (users.length) {
        if (users.length === 1) {
          return users[0];
        }
        return users;
      }
    }
    else {
      return validators.MqlId(creator, {if_empty:null});
    }
  }
  return null;
};

function get_timestamp(timestamp) {
  if (timestamp) {
    if (timestamp in TIMESTAMPS) {
      return acre.freebase.date_to_iso(TIMESTAMPS[timestamp]());
    }
    else {
      if (h.is_array(timestamp) && timestamp.length === 2) {
        timestamp[0] = validators.Timestamp(timestamp[0], {if_empty:null});
        timestamp[1] = validators.Timestamp(timestamp[1], {if_empty:null});
        if (timestamp[0]) {
          if (timestamp[1]) {
            return timestamp;
          }
          return timestamp[0];
        }
      }
      return validators.Timestamp(timestamp, {if_empty:null});
    }
  }
  return null;
};

function get_limit(limit) {
  // calculate limit, prev_limit, next_limit
  limit = validators.Int(limit, {if_invalid:LIMIT});
  if (limit < 1) {
    limit = LIMIT;
  }
  return limit;
};

function get_as_of_time(as_of_time) {
  return validators.Timestamp(as_of_time, {if_empty:null});
};

function mqlread_options(filters) {
  var options = {};
  if (!filters) {
    return options;
  }
  if (filters.as_of_time) {
    options.as_of_time = filters.as_of_time;
  }
  return options;
};

function apply_filters(clause, filters) {
  if (!filters) {
    return clause;
  }
  // limit
  apply_limit(clause, filters.limit);
  // timestamp
  apply_timestamp(clause.link, filters.timestamp);
  // creator
  apply_creator(clause.link, filters.creator);
  // history
  apply_history(clause.link, filters.history);
  // domain
  apply_domain_type_property(clause.link, filters.domain, filters.type, filters.property);
  return clause;
};

function apply_limit(clause, limit) {
  if (limit) {
    clause.limit = limit;
  }
  return clause;
};

function apply_timestamp(clause, timestamp) {
  if (timestamp) {
    if (h.is_array(timestamp) && timestamp.length === 2) {
      clause["a:timestamp>="] = timestamp[0];
      clause["b:timestamp<"] = timestamp[1];
    }
    else {
      clause["a:timestamp>="] = timestamp;
    }
  }
  return clause;
};

function apply_creator(clause, creator) {
  if (creator) {
    if (h.is_array(creator) && creator.length) {
      clause["filter:creator"] = {"id|=": creator};
    }
    else {
      clause["filter:creator"] = creator;
    }
  }
  return clause;
};

function apply_history(clause, history) {
  if (history) {
    clause.valid = null;
    clause.operation = null;
  }
  return clause;
};

function apply_domain_type_property(clause, domain, type, property) {
  if (clause.master_property === "/type/namespace/keys") {
    /**
     * set constraint on the master_property.reverse_property since we are
     * showing the reverse_property for keys
     */
    if (domain) {
      clause["filter:master_property"] = {reverse_property:{schema:{domain:domain}}};
    }
    else if (type) {
      clause["filter:master_property"] = {reverse_property:{schema:type}};
    }
    else if (property) {
      clause["filter:master_property"] = {reverse_property:property};
    }
  }
  else {
    if (domain) {
      clause["filter:master_property"] = {schema:{domain:domain}};
    }
    else if (type) {
      clause["filter:master_property"] = {schema:type};
    }
    else if (property) {
      clause.master_property = property;
    }
  }
  return clause;
};


function filter_url(filter_options, filter_key, filter_val) {
  var o = h.extend({}, filter_options);
  var url = h.url_for("triples", null, null, o.id);
  delete o.id;
  if (o.limit == LIMIT) {
    delete o.limit;
  }
  o[filter_key] = filter_val;
  var params = {};
  for (var key in o) {
    var v = o[key];
    if (v != null) {
      params[key] = v;
    }
  }
  return acre.form.build_url(url, params);
};

function remove_filter_url(filter_options, filter_key, filter_value) {
  var o = h.extend({}, filter_options);
  var url = h.url_for("triples", null, null, o.id);
  delete o.id;
  if (o.limit == LIMIT) {
    delete o.limit;
  }
  if (filter_value == null) {
    delete o[filter_key];
  }
  else {
    var values = o[filter_key];
    if (!h.is_array(values)) {
      values = [values];
    }
    var filtered_values = [];
    values.forEach(function(v) {
      if (v !== filter_value) {
        filtered_values.push(v);
      }
    });
    if (filtered_values.length) {
      o[filter_key] = filtered_values;
    }
    else {
      delete o[filter_key];
    }
  }
  var params = {};
  for (var key in o) {
    var v = o[key];
    if (v != null) {
      params[key] = v;
    }
  }
  return acre.form.build_url(url, params);
};

/**
 * Given the domain|type|property filter option, lookup the count data in prop_counts (bdb json format) and return
 * the data suitable for a chart graph.
 *
 * If domain, the data is prop_counts[domain],
 * If type, the data is prop_counts[domain][type],
 * If property, the data is prop_counts[domain][type][property]
 */
function get_bar_graph_data(filter_options, prop_counts) {
  var o = filter_options;
  var domain = o.domain;
  var type = o.type;
  var property = o.property;

  var data;
  // keep track of the id_prefix since the prop_counts bdb splits the type/property id's to be as minimal as possible
  var id_prefix = "";
  if (domain) {
    data = prop_counts[domain];
    id_prefix = domain;
  }
  else if (type) {
    domain = acre.freebase.mqlread({id:type, type:"/type/type", domain:null}).result.domain;
    data = prop_counts[domain];
    if (data) {
      data = data["/"+type.split("/").pop()];
      id_prefix = type;
    }
  }
  else if (property) {
    type = acre.freebase.mqlread({id:property, type:"/type/property", schema: {id:null, domain:null}}).result.schema;
    domain = type.domain;
    type = type.id;
    data = prop_counts[domain];
    if (data) {
      data =  data["/"+type.split("/").pop()];
      if (data) {
        data = data["/"+property.split("/").pop()];
        if (data != null) {
          return [{id:"total", total:100, t:data}];
        }
      }
    }
    return null;
  }
  else {
    data = prop_counts;
  }
  if (data == null) {
    return null;
  }
  var list = [];
  for (k in data) {
    if (k === 'ti' || k == 'to') continue;
    var counts = data[k];
    if (typeof counts === "number") {
      counts = {t:counts};
    }
    else {
      counts.t = counts.ti + counts.to;
    }
    list.push([k, counts]);
  }
  if (!list.length) {
    return null;
  }
  list.sort(function(a,b) {
    return b[1].t - a[1].t;
  });
  var first = list[0];
  var first_total = first[1].t;
  if (first_total < 1) {
    return null;
  }
  var new_options = h.extend({}, filter_options);
  delete new_options.domain;
  delete new_options.type;
  delete new_options.property;
  var filter_key;
  if (o.domain) {
    filter_key = "type";
  }
  else if (o.type) {
    filter_key = "property";
  }
  else {
    filter_key = "domain";
  }
  var chart_data = [];
  list.forEach(function(item) {
    var count = item[1];
    data = {
      id: id_prefix + item[0],
      t: count.t,
      total: Math.round((100*count.t)/first_total)
    };
    if ("ti" in count && "to" in count) {
      data.ti = count.ti;
      data.to = count.to;
      data.incoming =  Math.round((100*count.ti)/first_total);
      data.outgoing = Math.round((100*count.to)/first_total);
    }
    data.url = filter_url(new_options, filter_key, data.id);
    chart_data.push(data);
  });
  return chart_data;
};
