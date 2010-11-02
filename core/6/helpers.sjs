// Aggregated helper functions from various files

var exports = {};
var self = this;

//-----All core helper files to use-----
include_helpers(this, "helpers_util");
include_helpers(this, "helpers_date");
include_helpers(this, "helpers_url");
include_helpers(this, "helpers_format");

//-----Functions for including new helpers-----
function include_helpers(scope, script) {
  if (typeof script === "string") {
    script = acre.require(script);
  }
  if (script.exports && typeof script.exports === "object") {
    for (var n in script.exports) {
      if (n in scope) {
        throw("Multiple helper method defined with the same name: " + n);
      }
      scope[n] = scope.exports[n] = script.exports[n];
    }
  }
}

function extend_helpers(scope) {
  include_helpers(scope, self);
  
  if (scope.acre.current_script === scope.acre.request.script) {
    output_helpers(scope);
  }
}

function output_helpers(scope) {
  var blacklist = ["AcreExitException", "URLError", "XMLHttpRequest"];
  
  if (!scope.exports || typeof scope.exports !== "object") return;
  
  acre.write("---Helper functions in this module---\n");
  for (var f in scope.exports) {
    var in_blacklist = false;
    blacklist.forEach(function (black) {
      if (f === black) {
        in_blacklist = true;
      }
    });
    
    if (scope.exports.hasOwnProperty(f) && 
        !in_blacklist && 
        typeof scope.exports[f] === 'function') {
      var code = scope.exports[f].toString();
      var signature = code.slice(code.indexOf("(")+1, code.indexOf(")"));
      acre.write(f+"("+signature+")\n\n");
    }
  }
}
