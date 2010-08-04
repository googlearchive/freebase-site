(function($, fb) {

  function init() {
    /*
        Show/Hide Included Types & Incoming Properties
    */
    var $included_types = $("#included-types-table");
    var $inherited_properties = $included_types.find("tbody").hide();
    var $incoming_properties = $("#incoming-properties-table").find("tbody:not(.expanded)").hide();

    $("#included-types-table .tbody-header, #incoming-properties-table .tbody-header").click(function(){
      var $row = $(this);
      var $tbody = $("tbody." + $row.attr("data-target"));
      var $trigger = $row.find(".tbody-header-title");

      if ($tbody.is(":hidden")) {
        $trigger.addClass("expanded");
        $tbody.slideDown();
        $row.addClass("expanded");
      }
      else {
        $trigger.removeClass("expanded");
        $tbody.slideUp();
        $row.removeClass("expanded");
      }
    });


    /*
        Return Link Tooltips
    */
    $(".return-link-trigger").tooltip({
      events: {def: "click,mouseout"},
      position: "top center",
      effect: "fade",
      delay: 300,
      offset: [-8, 0]
    });

  };

  $(init);

})(jQuery, window.freebase);
