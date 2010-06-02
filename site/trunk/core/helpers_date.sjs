__all__ = [
  "parse_date",
  "format_date",
  "relative_date"
];

/**
 * Date library to parse and format dates using datejs library
 */

var mf = acre.require("MANIFEST").MF;
var datejs = acre.require("/freebase/apps/libraries/date", mf.version["/freebase/apps/libraries"]).Date;

/**
 * Converts the specified string value into its JavaScript Date equivalent using conventional format recognized by datejs,
 * if format is not specified. If using the specified format (string) or formats (array), the format of the date string value
 * must match one of the supplied formats exactly.
 *
 * @param date_str (String, required) - The string value to convert into a Date object.
 * @param format (String, optional) - The expected format of the date string.
 * @return (Date) A Date object or null if the string cannot be converted into a Date.
 *
 * @see http://code.google.com/p/datejs/ for format specifiers
 */
function parse_date(date_str, format /* optional */) {
  if (format) {
    return datejs.parseExact(date_str, format);
  }
  else {
    return datejs.parse(date_str);
  }
};

/**
 * Converts the value of the current Date object to its equivalent string representation.
 * Use format argument to specify format (optional).
 *
 * @param date (Date, required) - The Javascript Date object to stringify.
 * @param format (String, optional) - A format string of supproted datejs format spcifiers.
 * @return (String) A string representation of the current Date object.
 *
 * @see http://code.google.com/p/datejs/ for format specifiers
 **/
function format_date(date, format /* optional */) {
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

