var exports = {
  "format_stat": format_stat
};

var mf = acre.require("MANIFEST").MF;

function format_stat(number) {
  return ""+number;
}

mf.require("core", "helpers").extend_helpers(this);