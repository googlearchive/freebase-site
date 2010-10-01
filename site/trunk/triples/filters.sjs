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

function get_filters(id) {
  var filters = {
    id: id,
    limit: get_limit(),
    timestamp: get_timestamp(),
    creator: get_creator(),
    as_of_time: get_as_of_time()
  };
  if (acre.request.params.domain) {
    filters.domain = validators.MqlId(acre.request.params.domain);
  }
  else if (acre.request.params.type) {
    filters.type = validators.MqlId(acre.request.params.type);
  }
  else if (acre.request.params.property) {
    filters.property = validators.MqlId(acre.request.params.property);
  }
  return filters;
};

function get_creator() {
  var creator = acre.request.params.creator;
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

function get_timestamp() {
  var timestamp = acre.request.params.timestamp;
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

function get_limit() {
  // calculate limit, prev_limit, next_limit
  var limit = validators.Int(acre.request.params.limit, {if_invalid:LIMIT});
  if (limit < 1) {
    limit = LIMIT;
  }
  return limit;
};

function get_as_of_time() {
  return validators.Timestamp(acre.request.params.as_of_time, {if_empty:null});
};

function mqlread_options(filters) {
  var options = {};
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

function apply_domain_type_property(clause, domain, type, property) {
  if (domain) {
    clause["filter:master_property"] = {schema:{domain:domain}};
  }
  else if (type) {
    clause["filter:master_property"] = {schema:type};
  }
  else if (property) {
    clause.master_property = property;
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
