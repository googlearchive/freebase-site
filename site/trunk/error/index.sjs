function main(scope, args) {
  var mf = acre.require("MANIFEST").MF;
  var renderer = mf.require("template", "renderer");
  var error_template = mf.require("template");

  renderer.render_page({"status": args.status}, error_template);
  if (args.status) {
    scope.acre.response.status = parseInt(args.status);
  }
};

if (acre.request.script == acre.current_script) {
  main(this, acre.request.params);
}
