;(function($) {

  var i,l,j,k;

  function init() {

    var somedate = new Date(2000, 3, 5, 11, 12, 13);
    var formats = $.validate_input.datetime.formats;

    var example_dates = [];
    for (i=0,l=formats.length; i<l; i+=2) {
      var format = formats[i];
      var iso_format = formats[i+1];
      example_dates.push(Globalize.format(somedate, format));
    }
    $("#datetime .ex").html("ex: \"" + example_dates.join("\", \"") + "\"");
    $("#datetime .data-input").data_input();

    var example_ints = [
      123456789,
      -1234,
      0
    ];
    for (i=0,l=example_ints.length; i<l; i++) {
      example_ints[i] = Globalize.format(example_ints[i], "n0");
    }
    $("#int .ex").html("ex: \"" + example_ints.join("\", \"") + "\"");
    $("#int .data-input").data_input();

    var example_floats = [
      1234.56789,
      -1234.56,
      .1234
    ];
    for (i=0,l=example_floats.length; i<l; i++) {
      var format = "n";
      var intstr = "" + example_floats[i];
      var index = intstr.indexOf(".");
      if (index !== -1) {
        format = "n" + intstr.substr(index + 1).length;
      }
      example_floats[i] = Globalize.format(example_floats[i], format);
    }
    $("#float .ex").html("ex: \"" + example_floats.join("\", \"") + "\"");
    $("#float .data-input").data_input();


    $(".data-input :text")
      .bind("valid", function(e, data) {
        $(this).parents(".data-input").next(".v").text(data.value).css("visibility", "visible");
      })
      .bind("invalid", function() {
        $(this).parents(".data-input").next(".v").css("visibility", "hidden");
      });
  };

  $(init);

})(jQuery);
