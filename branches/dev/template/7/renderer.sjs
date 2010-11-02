var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var h = mf.require("core", "helpers_util");

// Call one of these once at the end of your controller to render a
//  freebase page, or single def with the results
function render_page(data, exports, base_template) {
  base_template = base_template || mf.require("freebase");
  return _render(data, base_template, "page", exports, [exports]);
}

function render_def(data, template, def_name, var_args) {
  var args = Array.prototype.slice.call(arguments, 3);
  return _render(data, template, def_name, template, args);
}

function _render(data, template, def_name, exports, args) {
  var d = {
    "data": deferred.all(data),
    "args": deferred.all(args)
  };
  
  var render_p = deferred.all(d).then(function(results) {
    if (exports && exports.c && typeof exports.c === "object") {
      h.extend(exports.c, results.data);
    }
    var response = template[def_name].apply(template, results.args);
    acre.write(response);
  });
  
  acre.async.wait_on_results();
  
  try {
    d.data.cleanup();
    d.args.cleanup();
    render_p.cleanup();
  } catch (e if !h.is_devel()) {
    /*
    var path = acre.form.build_url("//error.site.freebase.dev/index", {status:500});
    acre.route(path);
    acre.exit();
    */
    acre.response.status = 302;
    acre.response.set_header("location", acre.freebase.site_host+"/error");
    acre.exit();
  }
  
  return "";
}