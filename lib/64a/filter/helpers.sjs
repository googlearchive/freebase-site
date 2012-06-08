/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var datejs = acre.require("datejs/date.sjs");

/**
 * extract only the known global filters from filters dict.
 */
function global_filters(filters) {
  var g = {};
  filters = filters || {};
  ["domain", "type", "property", "domains"].forEach(function(k) {
    var v = filters[k];
    if (v != null) {
      g[k] = v;
    }
  });
  return g;
};

/**
 * remove a filter from filters.
 * filters is untouched and a copy is returned.
 */
function remove_filter(filters, name, value) {
  var f = h.extend(true, {}, filters);
  if (typeof value !== "undefined") {
    var existing = f[name];
    if (h.isArray(existing)) {
      var updated = [];
      existing.forEach(function(v) {
        if (v !== value) {
          updated.push(v);
        }
      });
      if (updated.length) {
        f[name] = updated;
      }
      else {
        f[name] = null;
      }
    }
    else if (existing === value) {
      f[name] = null;
    }
  }
  else {
    f[name] = null;
  }
  for (var k in f) {
    if (f[k] == null) {
      delete f[k];
    }
  }
  return f;
};

/**
 * add a filter to filters
 * filters is untouched and a copy is returned.
 */
function add_filter(filters, name, value) {
  var f = h.extend(true, {}, filters);
  f[name] = value;
  for (var k in f) {
    if (f[k] == null) {
      delete f[k];
    }
  }
  return f;
};


function get_linkcount_by_domain(linkcount, domain_id) {
    var domains = linkcount;
    if (domains) {
        for (var i=0,l=domains.length; i<l; i++) {
            var d = domains[i];
            if (d.id === domain_id) {
                return d && d.values || null;
            }
        }
    }
    return null;
};
function get_linkcount_by_type(linkcount, type_id) {
    var path = type_id.split("/");
    path.pop();
    var domain_id = path.join("/");
    var types = get_linkcount_by_domain(linkcount, domain_id);
    if (types) {
        for (var i=0,l=types.length; i<l; i++) {
            var t = types[i];
            if (t.id === type_id) {
                return t && t.values || null;
            }
        }
    };
    return null;
};
function get_linkcount_by_prop(linkcount, prop_id) {
    var path = prop_id.split("/");
    path.pop();
    var type_id = path.join("/");
    var props = get_linkcount_by_type(linkcount, type_id);
    if (props) {
        for (var i=0,l=props.length; i<l; i++) {
            var p = props[i];
            if (p.id === prop_id) {
                return p && p.values || null;
            }
        }
    };
    return null;
};

/**
 * If all=TRUE, get all domains. Otherwise only return "Commons" domains 
 */
function get_linkcount_all(linkcount, all) {
    var domains = linkcount;
    if (domains) {
        return domains.filter(function(d) {
            return all || h.is_commons_domain(d);
        });
    }
    return null;
};

/**
 * Given the domain|type|property filter option and 
 * linkcount (from topic api /freebase/object_profile/linkcount),
 * get the data suitable for a chart graph.
 *
 * If domain, the data is linkcount[domain],
 * If type, the data is linkcount[domain][type],
 * If property, the data is linkcount[domain][type][property]
 */
function get_bar_graph_data(filters, linkcount) {
  var domain = filters.domain;
  var type = filters.type;
  var property = filters.property;

  var data;
  var next_filter;
  if (domain) {
      data = get_linkcount_by_domain(linkcount, domain);
      next_filter = "type";
  }
  else if (type) {
      data = get_linkcount_by_type(linkcount, type);
      next_filter = "property";
  }
  else if (property) {
      return null;
  }
  else {
      data = get_linkcount_all(linkcount, true);
      next_filter = "domain";
  }
  if (data) {
      if (data && data.length) {
          var max = data[0].count;
          var new_filters = h.extend(true, {}, filters);
          delete new_filters.domain;
          delete new_filters.type;
          delete new_filters.property;
          var chart_data = [];
          data.forEach(function(v) {
              var item = {
                  id: v.id,
                  count: v.count,
                  width: Math.round(v.count*100/max),
                  params: add_filter(new_filters, next_filter, v.id)
              };
              chart_data.push(item);
          });
          return chart_data;
      }
  }
  return null;
};




/**
 * Relative timestamp helpers
 */
var TIMESTAMPS = {
 "today": function() {return datejs.Date.today();},
 "yesterday" : function() {return datejs.Date.today().addDays(-1);},
 "this week" : function() {return datejs.Date.today().moveToDayOfWeek(1, -1);},
 "this month" : function() {return datejs.Date.today().moveToFirstDayOfMonth();},
 "this year" : function() {
   var t = datejs.Date.today();
   t.set({day:1,month:0,year:t.getFullYear()});
   return t;
 }
};

/**
 * if ts is defined in TIMESTAMPS, return the actual timestamp
 * otherwise just return ts;
 */
function timestamp(ts) {
  if (ts in TIMESTAMPS) {
    return TIMESTAMPS[ts]();
  }
  return ts;
};
