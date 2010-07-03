// Aggregated helper functions from various files

function output_helpers() {
  var blacklist = ["AcreExitException", "URLError", "XMLHttpRequest"];
  
  acre.write("---Helper functions in this module---\n");
  for (var f in this) {
    var in_blacklist = false;
    blacklist.forEach(function (black) {
      if (f === black) {
        in_blacklist = true;
      }
    });
    
    if (this.hasOwnProperty(f) && 
        !in_blacklist && 
        typeof this[f] === 'function') {
      var code = this[f].toString();
      var signature = code.slice(code.indexOf("(")+1, code.indexOf(")"));
      acre.write(f+"("+signature+")\n\n");
    }
  }
}

acre.require.apply(this, ["helpers_util"]);
acre.require.apply(this, ["helpers_date"]);
acre.require.apply(this, ["helpers_url"]);
acre.require.apply(this, ["helpers_format"]);