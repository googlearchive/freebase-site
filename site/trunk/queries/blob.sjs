var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("helpers");
var extend = mf.require("core", "helpers_util").extend;

function get_blob(id) {
  return freebase.get_blob(id, "raw")
    .then(function(blob) {
      return blob.body;
    });
};

function get_blurb(id, options) {
  var o = extend({maxlength: 100}, options);
  return freebase.get_blob(id, "blurb", o)
    .then(function(blob) {
      return blob.body;
    });
};


