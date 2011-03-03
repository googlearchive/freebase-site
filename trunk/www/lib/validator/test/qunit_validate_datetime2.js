(function($) {

  var skip = {
    // $.datepicker.regional DOES NOT exist for these languages
    "/lang/fil": 1,
    "/lang/hi": 1,
    "/lang/es-419": 1,

    // known validator tests failures
    "2011/十一/22": 1,            // Chinese
    "2012/十二/24": 1,            // Chinese
    "14 červenec 2007": 1,        // Czech
    "20/Tháng 10/2010": 1,        // Vietnamese
    "22/Tháng 11/2011": 1,        // Vietnamese
    "22.Tháng Mười Một.2011": 1,  // Vietnamese
    "24/Tháng 12/2012": 1,        // Vietnamese
    "24.Tháng Mười Hai.2012": 1   // Vietnamese
  };

  $(function() {
    var input = $("#validate_input");

    test("regional codes", function() {
      $.each(LANGS, function(i, lang) {
        var id = lang.id;
        if (skip[id]) {
          return;
        }
        var codes = lang.code;
        var regions = [];
        $.each(codes, function(j, code) {
          if (code === "en-US") {
            code = "";
          }
          var region = $.datepicker.regional[code];
          if (region) {
            regions.push(code);
          }
        });
        if (regions.length === 0) {
          ok(false, "$.datepicker.regional not found for " + id);
        }
        else if (regions.length === 1) {
          ok(true, "$.datepicker.regional['" + regions[0] + "'] found for " + id);
        }
        else { // > 1
          ok(false, "multiple $.datepicker.regional found for " + id + ": " + regions.join(","));
        }
      });
    });

    test("$.datepicker.validator.regional", function() {
      $.each(LANGS, function(i, lang) {
        var regional = $.datepicker.validator.regional(lang.id);
        ok(regional, "Got $.datepicker.regional for " + lang.id);
      });
    });

    test("$.datepicker.validator.pad", function() {
      for (var i=1; i<32; i++) {
        same($.datepicker.validator.pad(i), i < 10 ? "0" + i : "" + i);
      }
      same($.datepicker.validator.pad("01"), "01");
    });

    test("$.datepicker.validator.format", function() {
      var format = $.datepicker.validator.format;
      same(format("mm/dd/yy", 2006), "2006");
      same(format("yy/mm/dd", null, 2, null), "2");
      same(format("yy/mm/dd", null, "02", null), "02");
      same(format("dd-mm-yy", null, null, "January"), "January");
      same(format("mm dd yy", 2011, "feb", 14), "feb 14 2011");
      same(format("yy-mm-dd", 1992, 9, null), "1992-9");
      same(format("yy.mm/dd", 1992, "09", 31), "1992.09.31");
    });

    var t=0;
    for (var i=t,l=LANGS.length; i<l; i++) {
      if (skip[LANGS[i].id]) continue;
      if (i>t) {
        //break;
      }
      (function() {
         var lang = LANGS[i];
         module(lang.id);
         test("validator", function() {
         var validator = $.datepicker.validator(lang.id);
           var tests = validator_tests(lang.id);
           $.each(tests, function(j, t) {
             var n = j*2+1;
             log("test", n, t);
             var datestr = t[0];
             if (skip[datestr]) {
               log("skipping", datestr);
               return;
             }
             var text = t[1];
             var value = t[2];
             try {
               var result = validator(datestr);
               if (result) {
                 equal(result.text, text, "text: " + datestr);
                 equal(result.value, value, "value: " + datestr);
               }
               else {
                 ok(false, "Couldn't validate: " + datestr);
               }
             }
             catch (ex) {
               ok(false, "got exception: " + ex);
             }
           });
         });
      })();

    };

  });

  function validator_tests(lang_id) {
    var regional = $.datepicker.validator.regional(lang_id);
    var tests = [
      ["2006", "2006", "2006"],
      ["-0100", "-0100", "-0100"]
    ];
    for (var month=1; month<13; month++) {
      var day = month*2;
      var year = 2000+month;
      // year+month
      tests = tests.concat(year_month_tests(regional, year, month));

      // year+month+day
      tests = tests.concat(year_month_day_tests(regional, year, month, day));
    }

    return tests;
  };

  /**
   * All possible enumerations of year+month:
   * M-yyyy,  yyyy-M
   * MM-yyyy, yyyy-MM
   * m-yyyy,  yyyy-m
   * mm-yyyy, yyyy-mm
   */
  function year_month_tests(regional, year, month) {
    var pmonth =  $.datepicker.validator.pad(month); // padded month
    var months = month_enumeration(regional, month);
    var dateFormat = regional.dateFormat;
    var value = $.datepicker.validator.format("yy-mm", year, pmonth);
    var text = $.datepicker.validator.format(dateFormat, year, pmonth);
    var tests = [];
    var delimiter = ["-", "/", ".", " "];
    for (var i=0; i<2; i++) {
      $.each(months, function(j, month) {
        var datestr = [year];
        if (i === 0) {
          datestr.unshift(month);
        }
        else {
          datestr.push(month);
        }
        tests.push([datestr.join(delimiter[j]), text, value]);
      });
    }
    return tests;
  };

  function year_month_day_tests(regional, year, month, day) {
    var pmonth = $.datepicker.validator.pad(month); // padded month
    var pday = $.datepicker.validator.pad(day); // padded day
    var months = month_enumeration(regional, month);
    var days = [
      day
    ];
    if ((""+day) != pday) {
      days.push(pday);
    }
    var dateFormat = regional.dateFormat;
    var format_parts = dateFormat.split(/[^ymd]/);

    var date = new Date(year, month-1, day);
    var value = $.datepicker.validator.format("yy-mm-dd", year, pmonth, pday);
    var text = $.datepicker.formatDate(dateFormat, date, regional);
    var tests = [];
    var delimiter = ["-", "/", ".", " "];
    var yy = year;

    $.each(months, function(j, month) {
      var mm = month;
      var delim = delimiter[j];
      $.each(days, function(j, day) {
        var dd = day;
        var datestr = $.datepicker.validator._format(format_parts, delim, yy, mm, dd);
        tests.push([datestr, text, value]);
      });
    });
    return tests;
  };

  /**
    * Return a set of all possible months representing the specified month number.
    * 1. month number (1-12)
    * 2. 0-padded number (01-09)
    * 3. regional.monthNamesShort
    * 4. regional.monthNames
    */
  function month_enumeration(regional, month) {
    var pmonth =  $.datepicker.validator.pad(month); // padded month
    var months = [];
    var seen = {};
    $.each([month, pmonth, regional.monthNamesShort[month-1], regional.monthNames[month-1]], function(i, m) {
      m = "" + m;
      if (!seen[m]) {
        months.push(m);
        seen[m] = 1;
      }
    });
    return months;
  };

  function log() {
    $.datepicker.validator.log.apply(null, arguments);
  }

})(jQuery);
