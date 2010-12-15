/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var exports = {
  "parse_date": parse_date,
  "format_date": format_date,
  "relative_date": relative_date
};

/**
 * Date library to parse and format dates using datejs library
 */

var mf = acre.require("MANIFEST").mf;
var datejs = mf.require("libraries", "date").Date;

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
 * Example Format:
 * dddd, dd MMMM yyyy -> Tuesday, 22 August 2006
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

