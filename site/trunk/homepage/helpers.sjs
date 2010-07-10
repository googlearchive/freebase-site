var exports = {
  "format_stat": format_stat
};

var mf = acre.require("MANIFEST").MF;

function format_stat(number) {
  return ""+number;
}

function compute_coverage_percentage(domain) {
  var last_week = domain.activity.weeks[domain.activity.weeks.length-1];
  return Math.round((last_week.f / last_week.c) * 100);
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

mf.require("core", "helpers").extend_helpers(this);