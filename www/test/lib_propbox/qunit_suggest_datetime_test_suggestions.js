$(function() {

  module('suggestions');

  var today = moment.utc();
  var sug = $.suggest.suggest_datetime.suggestions;

  test('oneOrTwoDigits', function() {
    var tests = [
      ['0', null],
      ['00', '2000'],
      ['1', [today.year()+'-01', '01']],
      ['01', [today.year()+'-01', '01', '2001']],
      ['24', ['00', '2024']],
      ['98', ['1998']]
    ];
    do_test(tests);
  });

  test('month', function() {
    var tests = [
      ['dec', [today.year()+'-12']],
      ['February', [today.year()+'-02']],
      ['jul', [today.year()+'-07']]
    ];
    do_test(tests);
  });

  test('month+year', function() {
    var tests = [
      ['12/01', '2001-12'],
      ['1/1999', '1999-01'],
      ['07.2013', '2013-07'],
      ['may 98', '1998-05'],
      ['December 01', '2001-12'],
      ['January 1939', '1939-01'],
      ['13 Jan', '2013-01'],
      ['1973 november', '1973-11']
    ];
    do_test(tests);
  });

  test('month+day', function() {
    var tests = [
      ['12/01', [today.year()+'-12-01', today.year()+'-01-12']],
      ['1/2', [today.year()+'-01-02', today.year()+'-02-01']],
      ['Jan 2', [today.year()+'-01-02']],
      ['February-1', [today.year()+'-02-01']],
      ['5 nov', [today.year()+'-11-05']],
      ['19.5', [today.year()+'-05-19']]
    ];
    do_test(tests);
  });

  test('month+day+year', function() {
    var tests = [
      ['1/2/03', ['2003-01-02', '2003-02-01']],
      ['19.05.1998', ['1998-05-19']],
      ['Jan 5 2001', ['2001-01-05']],
      ['Feb 24, 1999', ['1999-02-24']],
      ['11 sept 2001', ['2001-09-11']]
    ];
    do_test(tests);
  });

  test('iso', function() {
    var tests = [
      // iso date(+time)
      ['001', null],
      ['2000', '2000'],
      ['2000-01', '2000-01'],
      ['2000-01-02', '2000-01-02'],
      ['2000-01-02T03', '2000-01-02T03'],
      ['2000-01-02T03:04', '2000-01-02T03:04'],
      ['2000-01-02T03:04:05', '2000-01-02T03:04:05'],
      ['2000-01-02T03:04:05.006', '2000-01-02T03:04:05.006'],
      ['2000-01-02T03:04:05.0006', '2000-01-02T03:04:05.0006'],
      ['2000-01-02T03:04:05.00006', null],
      ['2000-01-02T03:04:05Z', '2000-01-02T03:04:05Z'],
      ['2000-01-02T03:04:05.0012Z', '2000-01-02T03:04:05.0012Z'],
      ['2000-01-02T03:04:05.0012Z+08:00', null],
      ['2000-01-02T03:04:05+08:00', '2000-01-02T03:04:05+08:00'],
      ['2000-01-02T03:04:05+0800', '2000-01-02T03:04:05+0800'],

      // iso time
      ['23', '23'],
      ['T23', '23'],
      ['01:02', '01:02'],
      ['T01:02', '01:02'],
      ['1:02', '01:02'],
      ['T1:02', '01:02'],
      ['1:02:03', '01:02:03'],
      ['T1:02:03', '01:02:03'],
      ['1:02:03.004', '01:02:03.004'],
      ['T1:02:03.0004', '01:02:03.0004']
    ];
    do_test(tests);
  });

  test("time of day", function() {
    var tests = [
      ['1am', '01:00'],
      ['1 AM', '01:00'],
      ['12 am', '00:00'],
      ['12:30AM', '00:30'],
      ['12:30 pm', '12:30'],
      ['11:59:59 PM', '23:59:59'],
      ['12:00:00 AM', '00:00:00']
    ];
    do_test(tests);
  });

  test("bce", function() {
    var tests = [
      ['-0000', '0000'],
      ['-1', '-0001'],
      ['-1000', '-1000'],
      ['0 BCE', null],
      ['1 BC', '0000'],
      ['BC 2000', '-1999'],
      ['bce 200', '-0199']
    ];
    do_test(tests);
  });

  function do_test(tests) {
    $.each(tests, function(i, t) {
      var input = t[0];
      var expected = t[1];
      var results = sug(input);
      console.log('results', input, results);
      if (expected == null || !expected.length) {
        ok(!results.length, "No suggestions");
        return;
      }
      if (!$.isArray(expected)) {
        expected = [expected];
      }
      var map = {};
      $.each(results, function(i, r) {
        map[r.value] = r.name;
      });
      $.each(expected, function(i, v) {
        ok(map[v], input + ' => ' + v + ' => ' + map[v]);
      });
    });
  }

});
