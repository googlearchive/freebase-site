var exports = {
  "format_stat": format_stat,
  "compute_coverage_percentage": compute_coverage_percentage,
  "lowercase_alphabet": lowercase_alphabet,
  "uppercase_alphabet": uppercase_alphabet
};

var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

function format_stat(number) {
  var abbr = ["K", "M", "B", "T"];
  for (var i=abbr.length; i>0; i--) {
    var power = Math.pow(10, i*3);
    if (number >= power) {
      return Math.round(number / power) + abbr[i-1];
    }
  }
  return ""+number;
}

function compute_coverage_percentage(domain) {
  var last_week = domain.activity.weeks[domain.activity.weeks.length-1];
  return Math.round((last_week.f / last_week.c) * 100);
}

function facts_per_topic(domain) {
  var value = domain.activity.total.e / domain.activity.total.t;
  value = Math.log(value) / Math.LN10;
  return Math.round(value * 10);
}

function lowercase_alphabet() {
  return ['a', 'b', 'c', 'd', 'e', 'f', 
          'g', 'h', 'i', 'j', 'k', 'l', 
          'm', 'n', 'o', 'p', 'q', 'r', 
          's', 't', 'u', 'v', 'w', 'x', 
          'y', 'z'];
}

function uppercase_alphabet() {
  return ['A', 'B', 'C', 'D', 'E', 'F', 
          'G', 'H', 'I', 'J', 'K', 'L', 
          'M', 'N', 'O', 'P', 'Q', 'R', 
          'S', 'T', 'U', 'V', 'W', 'X', 
          'Y', 'Z'];
}

h.extend_helpers(this);
