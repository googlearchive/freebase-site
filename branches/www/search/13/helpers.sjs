/*
 * Copyright 2013, Google Inc.
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

var h = acre.require('lib/helper/helpers.sjs');

function operator(operand, args) {
  if (operand == null || args == null || args === '') {
    return null;
  }
  if (typeof args === 'string') {
    args = [args];
  }
  if (args.length === 0) {
    return null;
  }
  var parts = [].concat(args);
  if (operand === 'any') {
    parts.unshift('any');
  }
  else if (operand === 'all') {
    parts.unshift('all');
  }
  else if (operand === 'should') {
    if (args.length > 1) {
      parts = [operator('any', args)];
    }
    parts.unshift('should');
  }
  else if (operand === 'not') {
    if (args.length > 1) {
      parts = [operator('any', args)];
    }
    parts.unshift('not');
  }
  else {
    return null;
  }
  return '(' + parts.join(' ') + ')';
}


function is_empty(v) {
  if (v == null || v === '') {
    return true;
  }
  var type = h.type(v);
  if (type === 'array') {
    return v.length === 0;
  } else if (type === 'object') {
    return h.isEmptyObject(v);
  } else {
    return false;
  }
};

var SEARCH_LANGS =
  'en,es,fr,de,it,pt,zh,ja,ko,ru,sv,fi,da,nl,el,ro,tr,hu'.split(',');
var SEARCH_LANGS_MAP = {};
SEARCH_LANGS.forEach(function(l) {
  SEARCH_LANGS_MAP[l] = 1;
});

function search_lang(preferred_lang) {
  preferred_lang = preferred_lang || '/lang/en';
  var code = h.lang_code(preferred_lang);
  if (code === 'en') {
    return code;
  }
  else if (SEARCH_LANGS_MAP[code]) {
    return code + ',en';
  }
  return 'en';
}


/**
 * Retrieve all type names from ouput=(type) results.
 */
function get_result_types(search_item) {
  var types = [];
  var seen = {};
  if (search_item.notable) {
    types.push(search_item.notable.name);
    seen[search_item.notable.id] = 1;
  }
  var o = get_result_output(search_item, 'type');
  if (o && o['/type/object/type']) {
    o['/type/object/type'].forEach(function(t) {
      if (!seen[t.id] && h.is_commons_domain(t.id) &&
          t.id !== '/common/topic') {
        types.push(first_value(t.name) || t.name);
        seen[t.id] = 1;
      }
    });
  }
  return types;
}

function get_notable_properties(search_item) {
  var notable_props = [];
  var o = get_result_output(search_item, 'notable:/client/summary');
  if (o) {
    var notable_paths = o['/common/topic/notable_paths'];
    if (notable_paths && notable_paths.length) {
      notable_paths.forEach(function(path) {
        notable_props.push({
          'name': h.id_key(path).replace(/_/g, ' '),
          'values': o[path]
        });
      });
    }
  }
  o = get_result_output(search_item, 'name');
  if (o && o['/common/topic/alias']) {
    notable_props.push({
      'name': 'alias',
      'values': o['/common/topic/alias']
    });
  }
  return notable_props;
}

/**
 * Retrieve the best description from ouput=(description) results
 * giving precedence to wikpedia then freebase descriptions.
 */
function get_result_description(search_item) {
  var o = get_result_output(search_item, 'description');
  if (o) {
    if (o.wikipedia) {
      return first_value(o.wikipedia);
    }
    else if (o.freebase) {
      return first_value(o.freebase);
    }
  }
  return null;
}

/**
 * Given output=(<key>), get the output key result.
 */
function get_result_output(search_item, key) {
  var output = search_item.output;
  if (output && output[key]) {
    return output[key];
  }
  return null;
}

/**
 * Get the first item in the list. If the first item is an object,
 * return its value.
 */
function first_value(list) {
  if (h.isArray(list) && list.length) {
    var first = list[0];
    if (h.isPlainObject(first)) {
      return first.value;
    }
    return first;
  }
  return null;
}

/**
 * Flatten search output values returned by search to a list that is more
 * suitable for rendering in a template.
 */
function flatten_search_values(values) {
  var res = [];
  values.forEach(function(value) {
    var item = {};
    if (h.isPlainObject(value)) {
      if (value['id'] || value['mid']) {
        item.id = value['id'] || value['mid'];
        item.text = first_value(value['name']) || value['name'];
      }
      else if (value['value'] != null) {
        item.text = value['value'];
      }
      // Search may return other additional values likes dates, etc.
      var extra_values = [];
      for (var k in value) {
        if (! (k == 'id' || k == 'mid' || k == 'name' ||
               k == 'value' || k == 'lang')) {
          extra_values.push(value[k]);
        }
      }
      if (extra_values.length) {
        item.text += ' (' + extra_values.join(', ') + ')';
      }
    }
    else {
      item.text = value;
    }
    res.push(item);
  });
  return res;
}
