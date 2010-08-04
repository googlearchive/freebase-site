
var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var edit = mf.require("editcomponents");

var api = {
  add_new_type_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_new_type_form(args.id, args.cvt == 1))
    };
  }
};

// required args
api.add_new_type_begin.args = ["id"]; // domain id, cvt (optional)


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
