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

mf.require("core", "helpers").extend_helpers(this);