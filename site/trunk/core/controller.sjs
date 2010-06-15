var mf = acre.require("MANIFEST").MF;
var deferred = acre.require("/freebase/site/promise/deferred");
var t = acre.require("template");
var h = acre.require("helpers_util");

// Call one of these once at the end of your controller to render a
//  freebase page, or single def with the results
function render_page(context, exports) {
  deferred.all(context).then(function (results) {
    if (exports.c) {
      h.extend(exports.c,  results);
    }
    acre.write(t.render_page(exports));
  });
  acre.async.wait_on_results();
}

function render_def(context, template, def_name, var_args) {
  var args = Array.prototype.slice.call(arguments, 3);
  var d = {
    "context": deferred.all(context),
    "args": deferred.all(args)
  };
  
  deferred.all(d).then(function(results) {
    if (template.exports.c) {
      h.extend(template.exports.c, results.context);
    }
    acre.write(t.render_def.apply(t, [template, def_name].concat(results.args)));
  });
  acre.async.wait_on_results();
}