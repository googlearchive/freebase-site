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




