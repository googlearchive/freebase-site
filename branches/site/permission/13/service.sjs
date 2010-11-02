
var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var queries = mf.require("queries");

var api = {
  has_permission: function(args) {
    return queries.has_permission(args.id, args.user_id, args.allow_experts);
  }
};

// required args
api.has_permission.args = ["id", "user_id"]; // allow_experts (optional)


function main(scope) {
  if (h.is_client()) {
    acre.response.set_cache_policy('fast');
  }
  var service = mf.require("core", "service");
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
