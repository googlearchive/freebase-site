//XXX: why test this? if (acre.current_script === acre.request.script) {

var path_info = acre.request.path_info;

var parts = path_info.split('/');
var filename = parts[1];

var md = acre.get_metadata();
if (filename !== "iframe" && filename in md.files) {
  var relative_url = path_info.replace(/^\//,''); //XXX: support query str?
  acre.route(relative_url); 
}

var mf = acre.require("MANIFEST").mf;

//XXX: TODO: should load page contents as promises, rather than in templates
var data = {
  base_path: '/'+acre.request.base_path.split('/')[1], // '/docs/xxx' --> '/docs'
  path_info:path_info
};

var renderer = mf.require("template", "renderer");

if (path_info==="/") {
  renderer.render_page(data,mf.require("index"));
} else if (filename === "iframe") {
	data.path_info = "/" + parts[2];
	renderer.render_page(data, mf.require("doc"), mf.require("iframe"));
} else {
  renderer.render_page(data,mf.require("doc"));
}


