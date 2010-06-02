
var mf = acre.require("MANIFEST").MF;
var date = acre.require("/freebase/apps/libraries/date", mf.version["/freebase/apps/libraries"]).Date;

function parse_date(date_str) {
  return date.parse(date_str);
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
  var dM = Math.floor(delta / (30 * 24 * 60 * 60 * 1000));
  var dD = Math.floor(delta / (24 * 60 * 60 * 1000));
  var dH = Math.floor(delta / (60 * 60 * 1000));
  var dN = Math.floor(delta / (60 * 1000));

  if (dY > 0)   { return dY === 1? "1 year ago"   : dY + " years ago"; }
  if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }
  if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }
  if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }
  if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
  if (dN == 0)  { return "less than a minute ago"; }
  if (dN < 0)   { return "in the future???"; }
};

