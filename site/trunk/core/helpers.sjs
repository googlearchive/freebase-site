// Aggregated helper functions from various files

var self = this;

function include(script_id) {
  var s = acre.require(script_id);
  if (s.exports && typeof s.exports === "object") {
    for (var n in s.exports) {
      if (n in self) {
        throw("Multiple helper method defined with the same name: " + n);
      }
      self[n] = s.exports[n];
    }
  }
};

include("helpers_util");
include("helpers_date");
include("helpers_url");
include("helpers_format");



/*
function output_helpers(scope) {
  var blacklist = ["AcreExitException", "URLError", "XMLHttpRequest"];

  acre.write("---Helper functions in this module---\n");
  for (var f in scope) {
    var in_blacklist = false;
    blacklist.forEach(function (black) {
      if (f === black) {
        in_blacklist = true;
      }
    });

    if (this.hasOwnProperty(f) &&
        !in_blacklist &&
        typeof this[f] === 'function') {
      var code = this[f].toString();
      var signature = code.slice(code.indexOf("(")+1, code.indexOf(")"));
      acre.write(f+"("+signature+")\n\n");
    }
  }
}

acre.require.apply(this, ["helpers_util"]);
acre.require.apply(this, ["helpers_date"]);
acre.require.apply(this, ["helpers_url"]);
acre.require.apply(this, ["helpers_format"]);
*/
