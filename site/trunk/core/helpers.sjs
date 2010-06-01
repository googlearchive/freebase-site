var self = this;

function include(script_id) {
  var s = acre.require(script_id);
  if (s.__all__) {
    s.__all__.forEach(function(m) {
      self[m] = s[m];
    });
  }
};

include("helpers_util");
include("helpers_url");
include("helpers_format");




