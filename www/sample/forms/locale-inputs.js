;(function($, dojo) {

  var i,l,j,k;

  function init() {

    var somedate = new Date(2000, 3, 5);
    var formats = $.validate_input.datetime.formats;
    var bundle = dojo.date.locale._getGregorianBundle(locale);

    var example_dates = [];
    for (i=0,l=formats.length; i<l; i+=2) {
      var dateFormats = formats[i+1];
      for (k=0,j=dateFormats.length; k<j; k++) {
        var dateFormat = dateFormats[k];
        var datePattern = bundle[dateFormat];
        if (datePattern) {
          datePattern = datePattern.replace(/L/g, "M");
          example_dates.push(dojo.date.locale.format(somedate, {datePattern:datePattern, selector:"date", locale:locale}));
        }
      }
    }
    $("#datetime .ex").html("ex: \"" + example_dates.join("\", \"") + "\"");
    $("#datetime .data-input").data_input({lang:lang});

    var example_ints = [
      123456789,
      -1234,
      0
    ];
    for (i=0,l=example_ints.length; i<l; i++) {
      example_ints[i] = dojo.number.format(example_ints[i], {locale:locale});
    }
    $("#int .ex").html("ex: \"" + example_ints.join("\", \"") + "\"");
    $("#int .data-input").data_input({lang:lang});

    var example_floats = [
      1234.56789,
      -1234.56,
      .1234
    ];
    for (i=0,l=example_floats.length; i<l; i++) {
      example_floats[i] = dojo.number.format(example_floats[i], {locale:locale});
    }
    $("#float .ex").html("ex: \"" + example_floats.join("\", \"") + "\"");
    $("#float .data-input").data_input({lang:lang});


    $(".data-input :text")
      .bind("valid", function(e, data) {
console.log("valid", data);
        $(this).parents(".data-input").next(".v").text(data.value).css("visibility", "visible");
      })
      .bind("invalid", function() {
        $(this).parents(".data-input").next(".v").css("visibility", "hidden");
      });
  };


  $(function() {
    setTimeout(init, 1000);
  });

})(jQuery, dojo);
