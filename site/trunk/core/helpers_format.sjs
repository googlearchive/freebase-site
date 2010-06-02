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

