/*
 * Copyright 2010, Google Inc.
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
var h = acre.require("lib/helper/helpers.sjs");
var datejs = acre.require("lib/datejs/date.sjs");

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

/**
 * return a triples data structure.
 * where s=subject, p=predicate and o=object.
 * In addition, a mql query representing the triple is provided.
 *
 * @param subject:String - mql id
 * @param predicate:String - mql property
 * @param object:Object - the object {id:String} or {value:String, lang:String(optional), namespace:String(optional)}
 */
function triple(subject, predicate, object, namespace, value) {
  var o = {
    s: subject,
    p: predicate
  };
  if (namespace && value) {
    o.o = {namespace:namespace, value:value};
  }
  else if ("id" in object) {
    o.o = {id: object.id};
  }
  else if ("value" in object) {
    o.o = {value: object.value};
    ["lang", "namespace"].forEach(function(key) {
      if (key in object) {
        o.o[key] = object[key];
      }
    });
  }
  o.mql = {id: subject};
  o.mql[predicate] = h.extend({}, o.o);
  o.mql = JSON.stringify(o.mql);
  return o;
};

function is_valid(link) {
  return (link.valid === false) ? false : true;
};

function valid_class(link) {
  return is_valid(link) ? "valid": "invalid";
};

function link_class(link) {
  var operation = "";
  if (link.operation != null) {
    operation = link.operation;
  }
  return h.trim(h.sprintf("%s %s", valid_class(link), operation));
};
