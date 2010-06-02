acre.require('/test/lib').enable(this);

var h = acre.require("helpers_date");


test("parse_date", function() {
  var tests = [
    "August 3, 1998",
    "Aug 03, 98",
    "3 August 1998",
    "8/3/98",
    "08/03/1998"
  ];

  tests.forEach(function(test) {
    var d = h.parse_date(test);
    equals(d.getMonth(), 7);
    equals(d.getDate(), 3);
    equals(d.getFullYear(), 1998);
  });
});

test("format_date", function() {
  var tests = [
    ["MMMM d, yyyy", "August 3, 1998"],
    ["MMM dd, yy", "Aug 03, 98"],
    ["d MM yy", "3 08 98"],
    ["M/d/yy", "8/3/98"],
    ["MM/dd/yyyy", "08/03/1998"]
  ];
  var d = new Date(1998, 7, 3);

  tests.forEach(function([format, expected]) {
    equals(h.format_date(d, format), expected);
  });
});

test("relative_date", function() {
  var d = new Date();
  d.setTime(d.getTime() - 30 * 1000);
  equals(h.relative_date(d), "less than a minute ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 60 * 1000);
  equals(h.relative_date(d), "1 minute ago");

  d = new Date();
  d.setTime(d.getTime() - 3 * 60 * 1000);
  equals(h.relative_date(d), "3 minutes ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 hour ago");

  d = new Date();
  d.setTime(d.getTime() - 23 * 60 * 60 * 1000);
  equals(h.relative_date(d), "23 hours ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 day ago");

  d = new Date();
  d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "6 days ago");

  d = new Date();
  d.setTime(d.getTime() - 29 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "29 days ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 30 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 month ago");

  d = new Date();
  d.setTime(d.getTime() - 65 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "2 months ago");

  d = new Date();
  d.setTime(d.getTime() - 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 year ago");

  d = new Date();
  d.setTime(d.getTime() - 1.5 * 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 year ago");

  d = new Date();
  d.setTime(d.getTime() - 2.5 * 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "2 years ago");
});

if (acre.current_script == acre.request.script) {
  acre.test.report();
}


