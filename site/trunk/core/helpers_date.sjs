__all__ = [
  "parse_date",
  "format_date",
  "relative_date"
];


var mf = acre.require("MANIFEST").MF;
var datejs = acre.require("/freebase/apps/libraries/date", mf.version["/freebase/apps/libraries"]).Date;

function parse_date(date_str) {
  return datejs.parse(date_str);
};

function format_date(date, format) {
  return date.toString(format);
};

/**
 * Relative date relative to current time
 */
function relative_date(d) {
  var c = new Date();

  var delta = c.getTime() - d.getTime();
  var dY = Math.floor(delta / (365 * 24 * 60 * 60 * 1000));
  if (dY > 0) { return dY === 1? "1 year ago"   : dY + " years ago"; }

  var dM = Math.floor(delta / (30 * 24 * 60 * 60 * 1000));
  if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }

  var dD = Math.floor(delta / (24 * 60 * 60 * 1000));
  if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }

  var dH = Math.floor(delta / (60 * 60 * 1000));
  if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }

  var dN = Math.floor(delta / (60 * 1000));
  if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
  else if (dN == 0)  { return "less than a minute ago"; }
  else /*(dN < 0)*/   { return "in the future???"; }
};

