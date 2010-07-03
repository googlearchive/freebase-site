var mf = acre.require("MANIFEST").MF;

function format_stat(number) {
  return ""+number;
}

mf.require.apply(this, ["core", "helpers"]);

if (acre.current_script === acre.request.script) {
  output_helpers(this);
}