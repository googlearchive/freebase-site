var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
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
  return freebase.get_blob(id, "blurb", options)
    .then(function(blob) {
      return blob.body;
    });
};


