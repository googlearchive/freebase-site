;(function(suggest, moment) {

  if (!suggest) {
    console.error('$.suggest is required');
    return;
  }

  if (!moment) {
    console.error('moment.js is required');
    return;
  }

  var REGEX = {
    iso: /^\d{4}-\d\d-\d\d(T| )\d\d:\d\d:\d\d(\.\d{1,4})?(Z|[\+\-]\d\d:?\d\d)?$/,

    iso_YYYY: /^\d{4}$/,
    iso_YYYY_MM: /^\d{4}-\d\d$/,
    iso_YYYY_MM_DD: /^\d{4}-\d\d-\d\d$/,
    iso_YYYY_MM_DDTHH: /^\d{4}-\d\d-\d\d(T| )\d\d$/,
    iso_YYYY_MM_DDTHH_mm: /^\d{4}-\d\d-\d\d(T| )\d\d:\d\d$/,
    iso_YYYY_MM_DDTHH_mm_ss: /^\d{4}-\d\d-\d\d(T| )\d\d:\d\d:\d\d$/,
    iso_YYYY_MM_DDTHH_mm_ss_S:
        /^\d{4}-\d\d-\d\d(T| )\d\d:\d\d:\d\d.\d{1,4}$/,

    iso_HH: /^\d\d$/,
    iso_HH_mm: /^\d\d?:\d\d$/,
    iso_HH_mm_ss: /^\d\d?:\d\d:\d\d$/,
    iso_HH_mm_ss_S: /^\d\d?:\d\d:\d\d\.\d{1,4}$/,


    negative_year: /^\-\d{4,}$/,
    bce: [
        /^(\d+)\s?[Bb]\.?[Cc](?:.?[Ee])?$/,
        /^[Bb]\.?[Cc](?:\.?[Ee])?\s?(\d+)$/
    ],

    oneToTwoDigits: /^\d\d?$/,
    date_tokens: /[\/\.\-\s]/
  };

  $.suggest('suggest_datetime', {

    request: function(val) {
      var results = $.suggest.suggest_datetime.suggestions(val);

      this.response(results);
    },

    _init: function() {
      this.lang = 'en';
      if (this.options.lang) {
        var code = this.options.lang.split('/').pop().toLowerCase();
        if (code !== 'en' && moment.langData(code)) {
          this.lang = code;
        }
      }
    },

    check_response: function() {
      return true;
    }

  });

  $.extend($.suggest.suggest_datetime, {
    defaults: {
      status: null,
      nomatch: {
        title: 'You can enter a datetime in many ways, ' +
            'just be sure to include the year when entering dates!',
        heading: 'Try:',
        tips: [
          'January 2007',
          '9/30/1986',
          '2001',
          '4/1975',
          '12:30 AM',
          '200 BC',
          '1973-11-05T12:00:00Z'
        ]
      }
    },

    suggestions: function(val) {
      val = $.trim(val);
      var results = [];
      var formatted = null;
      var today = moment.utc();
      var m = null;
      // Try common formats first

      /**
       * 1 or 2-digits can be month, hour or year
       */
      if (/^\d\d?$/.test(val)) {
        var n = parseInt(val, 10);
        if (n > 0) {
          // can be hour, month or year
          if (n <= 12) {
            m = moment.utc([today.year(), val-1]);
            results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
          }
          if (n <= 24) {
            m = moment.utc(val, 'h A');
            results.push(suggestion(m, 'LT', 'HH'));
          }
          if (val.length === 2) {
            m = moment.utc([guess_year(val)]);
            results.push(suggestion(m, 'YYYY', 'YYYY'));
          }
        }
        if (val === '00') { // 2000
          m = moment.utc([2000]);
          results.push(suggestion(m, 'YYYY', 'YYYY'));
        }
      }

      /**
       * Just Month (+current year)
       * <ul>
       *   <li>jan</li>
       *   <li>january</li>
       * </ul>
       */
      // MMM
      if (/^\w+$/.test(val)) {
        m = moment.utc(val, 'MMM');
        if (m.isValid()) {
          m = moment.utc([today.year(), m.month()]);
          results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
        }
      }

      /**
       * Month and Year
       * <ul>
       *   <li>1/02</li>
       *   <li>1/2002</li>
       *   <li>jan 2002</li>
       *   <li>january 2002</li>
       *   <li>2002 jan</li>
       * </ul>
       */
      // M/Y
      if (/^\d\d?[\/\.\-\s](\d\d|\d{4})$/.test(val)) {
        var parts = val.split(REGEX.date_tokens);
        var month = parseInt(parts[0], 10);
        var year = parseInt(parts[1], 10);
        if (month > 0 && month <= 12) {
          // M/Y
          m = moment.utc([guess_year(parts[1]), month - 1]);
          results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
        }
      }
      // MMM/Y
      if (/^\w+[\/\.\-\s](\d\d|\d{4})$/.test(val)) {
        var year = guess_year(val.split(REGEX.date_tokens)[1]);
        m = moment.utc(val, 'MMM');
        if (m.isValid()) {
          m = moment.utc([year, m.month()]);
          results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
        }
      }
      // Y/MMM
      if (/^(\d\d|\d{4})[\/\.\-\s]\w+$/.test(val)) {
        var year = guess_year(val.split(REGEX.date_tokens)[0]);
        m = moment.utc(val, 'MMM');
        if (m.isValid()) {
          m = moment.utc([year, m.month()]);
          results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
        }
      }

      /**
       * Month and Day (+current year)
       * <ul>
       *   <li>1/02</li> // Jan 2 or Feb 1
       *   <li>25.12</li> // Dec 25
       *   <li>jan 2</li>
       *   <li>25 december</li>
       * </ul>
       */
      // M/D or D/M
      if (/^\d\d?[\/\.\-\s]\d\d?$/.test(val)) {
        var parts = val.split(REGEX.date_tokens);
        var month = parseInt(parts[0], 10);
        var day = parseInt(parts[1], 10);
        if (month > 0 && day > 0) {
          if (month <= 12) {
            // M/D
            m = moment.utc([today.year(), month-1, day]);
            results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
          }
          if (day <= 12) {
            // D/M
            m = moment.utc([today.year(), day-1, month]);
            results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
          }
        }
      }
      // MMM/D
      if (/^\w+[\/\.\-\s]\d\d?$/.test(val)) {
        m = moment.utc(val, 'MMM/D');
        if (m.isValid()) {
          m = moment.utc([today.year(), m.month(), m.date()]);
          results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
        }
      }
      // D/MMM
      if (/^\d\d?[\/\.\-\s]\w+$/.test(val)) {
        m = moment.utc(val, 'D/MMM');
        if (m.isValid()) {
          m = moment.utc([today.year(), m.month(), m.date()]);
          results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
        }
      }

      /**
       * Month, Day and Year
       */
      // M/D/Y or D/M/Y
      if (/^\d\d?[\/\.\-\s]\d\d?[\/\.\-\s](\d\d|\d{4})$/.test(val)) {
        var parts = val.split(REGEX.date_tokens);
        var month = parseInt(parts[0], 10);
        var day = parseInt(parts[1], 10);
        var year = guess_year(parts[2]);
        if (month > 0 && day > 0) {
          if (month <= 12) {
            // M/D/Y
            m = moment.utc([year, month-1, day]);
            results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
          }
          if (day <= 12) {
            // D/M/Y
            m = moment.utc([year, day-1, month]);
            results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
          }
        }
      }
      // MMM/D/Y
      if (/^\w+[\/\.\-\s]\d\d?[\/\.\-\s\,]+(\d\d|\d{4})$/.test(val)) {
        var parts = val.split(/[\/\.\-\s\,]/);
        var day = parts[1];
        var year = guess_year(parts.pop());
        m = moment.utc(val, 'MMM');
        if (m.isValid()) {
          m = moment.utc([year, m.month(), day]);
          results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
        }
      }
      // MMM/D/Y
      if (/^\d\d?[\/\.\-\s]\w+[\/\.\-\s\,]+(\d\d|\d{4})$/.test(val)) {
        var parts = val.split(/[\/\.\-\s\,]/);
        var day = parts[0];
        var year = guess_year(parts.pop());
        m = moment.utc(val, 'MMM');
        if (m.isValid()) {
          m = moment.utc([year, m.month(), day]);
          results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
        }
      }

      /**
       * ISO date, date+time or time
       * <ul>
       *   <li>2000</li>
       *   <li>2000-01<li>
       *   <li>2000-01-02</li>
       *   <li>2000-01-03T04<li>
       *   <li>2000-01-04 05:06<li>
       *   <li>2000-01-04 05:06:07<li>
       *   <li>2000-01-04 05:06:07.008<li>
       */
      // try iso date (YYYY-MM-DD),
      // date+time (YYYY-MM-DDTHH:mm:ss),
      // and time (HH:mm:ss);
      if (REGEX.iso_YYYY.test(val)) {
        if (val === '0000') {
          // year 0 is 1 BCE
          results.push(suggestion(bce(1), null, val));
        }
        else {
          results.push(suggestion(val));
        }
      } else if (REGEX.iso_YYYY_MM.test(val)) {
        m = moment.utc(val, 'YYYY-MM');
        results.push(suggestion(m, 'MMMM YYYY', 'YYYY-MM'));
      } else if (REGEX.iso_YYYY_MM_DD.test(val)) {
        m = moment.utc(val, 'YYYY-MM-DD');
        results.push(suggestion(m, 'LL', 'YYYY-MM-DD'));
      } else if (REGEX.iso_YYYY_MM_DDTHH.test(val)) {
        m = moment.utc(val, 'YYYY-MM-DDTHH');
        results.push(suggestion(m, 'LLL', 'YYYY-MM-DDTHH'));
      } else if (REGEX.iso_YYYY_MM_DDTHH_mm.test(val)) {
        m = moment.utc(val, 'YYYY-MM-DDTHH:mm');
        results.push(suggestion(m, 'LLL', 'YYYY-MM-DDTHH:mm'));
      } else if (REGEX.iso_YYYY_MM_DDTHH_mm_ss.test(val)) {
        m = moment.utc(val, 'YYYY-MM-DDTHH:mm:ss');
        results.push(suggestion(m, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss'));
      } else if (REGEX.iso_YYYY_MM_DDTHH_mm_ss_S.test(val) ||
                 REGEX.iso.test(val)) {
        results.push(suggestion(val));
      } else {
        var time = val.split('T').pop();  // Remove beginning 'T' if any
        if (REGEX.iso_HH.test(time)) {
          m = moment.utc(time, 'HH');
          if (m.isValid()) {
            results.push(suggestion(m, 'LT', 'HH'));
          }
        } else if (REGEX.iso_HH_mm.test(time)) {
          m = moment.utc(time, 'HH:mm');
          if (m.isValid()) {
            results.push(suggestion(m, 'LT', 'HH:mm'));
          }
        } else if (REGEX.iso_HH_mm_ss.test(time)) {
          m = moment.utc(time, 'HH:mm:ss');
          if (m.isValid()) {
            results.push(suggestion(m, 'HH:mm:ss', 'HH:mm:ss'));
          }
        } else if (REGEX.iso_HH_mm_ss_S.test(time)) {
          var parts = time.split('.');
          m = moment.utc(parts[0], 'HH:mm:ss');
          time = m.format('HH:mm:ss') + '.' + parts[1];
          results.push(suggestion(time));
        }
      }

      /**
       * Time of day
       * <ul>
       *   <li>1am</li>
       *   <li>12:30 PM</li>
       *   <li>5:43am</li>
       *   <li>11:59:59 pm</li>
       * </ul>
       */
      if (/^\d\d?\s?[aApP][mM]$/.test(val)) {
        m = moment.utc(val, 'h A');
        if (m.isValid()) {
          results.push(suggestion(m, 'LT', 'HH:mm'));
        }
      } else if (/^\d\d?:\d\d\s?[aApP][mM]$/.test(val)) {
        m = moment.utc(val, 'h:mm A');
        if (m.isValid()) {
          results.push(suggestion(m, 'LT', 'HH:mm'));
        }
      } else if (/^\d\d?:\d\d:\d\d\s?[aApP][mM]$/.test(val)) {
        m = moment.utc(val, 'h:mm:ss A');
        if (m.isValid()) {
          results.push(suggestion(m, 'HH:mm:ss', 'HH:mm:ss'));
        }
      }

      /**
       * BCE year
       * <ul>
       *   <li>-1</li>  // 2 BCE
       *   <li>1 B.C.E</li> // year 0000
       *   <li>1000 BCE</li>
       * </ul>
       */
      if (/^\-\d+$/.test(val)) {
        var year = parseInt(val.substring(1), 10);
        if (year === 0) {
          // year 0 is 1 BCE
          results.push(suggestion(bce(1), null, '0000'));
        }
        else {
          // year 1 is 2 BCE
          results.push(suggestion(bce(year+1), null, '-' + padyear(year)));
        }
      }
      for (var i=0,l=REGEX.bce.length; i<l; i++) {
        var match = REGEX.bce[i].exec(val);
        if (match) {
          var year = parseInt(match[1], 10);
          if (year > 0) {
            if (year == 1) {
              // 1 BCE is year 0
              results.push(suggestion(bce(1), null, '0000'));
            }
            else {
              results.push(suggestion(bce(year), null, '-' + padyear(year-1)));
            }
          }
        }
      };

      // Remove duplicate entries
      var set = [];
      var seen = {};
      $.each(results, function(i, data) {
        var key = data.name + "$$" + data.value;
        if (!seen[key]) {
          set.push(data);
          seen[key] = 1;
        }
      });

      /**
       * TODO(daepark): moment.lang parse/format for other languages than en
       */

      return set;
    }
  });

  function padyear(y) {
    if (y < 10) {
      return "000" + y;
    }
    else if (y < 100) {
      return "00" + y;
    }
    else if (y < 1000) {
      return "0" + y;
    }
    return "" + y;
  }

  function bce(y) {
    return y + ' BCE';
  }

  function debug(str) {
    return ' (' + str + ')';
  }

  function suggestion(m, name_format, value_format) {
    var name = null;
    var value = null;
    if (typeof m === 'string') {
      // Just echo the value
      name = name_format || m;
      value = value_format || m;
    }
    else {
      name = m.format(name_format);
      value = m.format(value_format);
    }
    return {
      name: name,
      value: value
    };
  }

  function guess_year(year) {
    var y = parseInt(year, 10);
    if ($.type(year) === 'string') {
      if (year.length > 2) {
        return y;
      } else if (year === '00') {
        return 2000;
      }
    }
    if (y < 100) {
      if (y < 40) { // 19xx and 20xx cutoff
        return 2000 + y;
      }
      return 1900 + y;
    }
    return y;
  }

})(jQuery.suggest, moment);
