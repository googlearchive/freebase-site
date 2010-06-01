__all__ = [
  "commafy",
  "round"
];

/**
 * Comma-fy integers
 */
function commafy(i) {
  var s = '' + i;
  x = s.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
};


/**
 * Round integer to the specified number of zeros
 *
 * round(150, 2) = 200
 * round(1100, 3) = 1000
 * round(1111, 2) = 1100
 */
function round(i,  rnd) {
  rnd = Math.pow(10, rnd);
  return Math.round(i/rnd)*rnd;
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

