var exports = {
  "extend": extend,
  "first_element": first_element,
  "trim": trim,
  "map_array": map_array,
  "is_array": is_array,
  "array_map": array_map
};

/**
 * TODO: this should go in some library
 *
 * @see jQuery.extend()
 */
function extend() {
  var a = arguments[0];
  for (var i=1,len=arguments.length; i<len; i++) {
    var b = arguments[i];
    for (var prop in b) {
      a[prop] = b[prop];
    }
  }
  return a;
};

function first_element(array) {
  if (array instanceof Array) {
    return array.length ? array[0] : null;
  } else {
    return array;
  }
};

function trim(s) {
  return s.replace(/^\s+|\s+$/g, "");
};

function map_array(a, key) {
  var map = {};
  for (var i=0,l=a.length; i<l; i++) {
    map[a[i][key]] = a[i];
  };
  return map;
};

function array_map(map) {
  var a = [];
  for (k in map) {
    a.push([k, map[k]]);
  }
  return a;
};

function is_array(obj) {
  return toString.call(obj) === "[object Array]";
};
