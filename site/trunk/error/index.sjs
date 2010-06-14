function main(scope, args) {
  var mf = acre.require("MANIFEST").MF;
  var extend = acre.require("/freebase/site/core/helpers_util", mf.version["/freebase/site/core"]).extend;
  var page_options = extend({}, args);
  var core_template = acre.require("/freebase/site/core/template", mf.version["/freebase/site/core"]);
  var error_template = acre.require("template");

  acre.write(acre.markup.stringify(core_template.render_page(error_template, page_options)));
  if (args.status) {
    scope.acre.response.status = parseInt(args.status);
  }
};

if (acre.request.script == acre.current_script) {
  main(this, acre.request.params);
}
