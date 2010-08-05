
var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var edit = mf.require("editcomponents");
var ServiceError = mf.require("core", "service").lib.ServiceError;
var create_type = mf.require("queries", "create_type").create_type;

var api = {
  add_new_type_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_new_type_form(args.id, args.cvt == 1))
    };
  },

  add_new_type_submit: function(args) {
    var data;
    try {
      data = JSON.parse(args.data);
      if (! (data instanceof Array)) {
        throw "data not an array";
      }
    }
    catch (e) {
      throw "data needs to be a JSON array";
    }    
    if (!data.length) {
      // nothing to do
      return "noop";
    }
    var promises = [];
    data.forEach(function(t) {
      //h.extend(t, {mqlkey_quote:true});
      //promises.push(create_type(t));
    });
    return data;
  }
};

// required args
api.add_new_type_begin.args = ["id"]; // domain id, cvt (optional)
api.add_new_type_submit.args = ["data"]; // data is JSON (Array)

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
