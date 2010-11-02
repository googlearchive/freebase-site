(function($, fb) {

  function init() {
    // init table sorter
    var table = $(".table-sortable").tablesorter();
    $("thead th:nth-child(2)", table)[0].count = 1;
    $("thead th:nth-child(3)", table)[0].count = 1;
    $("thead th:nth-child(4)", table)[0].count = 1;

    // Setup schema search tabset
    var $schema_explorer_search_tabset = $("#schema-search > .section-tabset").tabs("#schema-search > .search-box", {
      initialIndex: 1
    });


    /*
        MQL_FILTERS are config parameters passed to respective
        Freebase Suggest instances for Domain, Type, and Property
        depending on whether the user has toggled Freebase Commons / All Projects
    */

    var MQL_FILTERS = {
      domain : [{ "key": [{"namespace" : "/" }] }],
      type : [{ "/type/type/domain": [{ "key" : [{ "namespace" : "/" }] }], "a:/type/type/domain": { "id": "/freebase", "optional" : "forbidden" } }],
      property : [{ "/type/property/schema": { "type": "/type/type", "domain": [{ "key" : [{ "namespace" : "/" }] }], "a:domain" : { "id" : "/freebase", "optional" : "forbidden" } } }]
    };


    // delete placeholder plugin as part of suggest
    $.fn.placeholder = $.noop;

    /*
        DOMAIN SUGGEST
    */
    var $domain_input = $("#domain-search-input");
    var $domain_form = $domain_input.closest("form");

    $domain_form.submit(function(){
      return false;
    });

    var domain_suggest_options = { "type" : "/type/domain" };

    if ($("#domain-search-toggle-commons").is(":checked")) {
      domain_suggest_options.mql_filter = MQL_FILTERS.domain;
    }

    $domain_input.suggest(domain_suggest_options)
      .bind("fb-select", function(e, data){
        window.location.href = fb.acre.request.app_url + "/schema" + data.id;
      })
      .focus(function() {
        this.select();
      });

    /*
        TYPE SUGGEST
    */
    var $type_input = $("#type-search-input");
    var $type_form = $type_input.closest("form");

    $type_form.submit(function(){
      return false;
    });

    var type_suggest_options = { "type" : "/type/type" };

    if ($("#type-search-toggle-commons").is(":checked")) {
      type_suggest_options.mql_filter = MQL_FILTERS.type;
    }

    $type_input.suggest(type_suggest_options)
      .bind("fb-select", function(e, data){
        window.location.href = fb.acre.request.app_url + "/schema" + data.id;
      })
      .focus(function() {
        this.select();
      });

    /*
        PROPERTY SUGGEST
    */
    var $property_input = $("#property-search-input");
    var $property_form = $property_input.closest("form");

    $property_form.submit(function(){
      return false;
    });

    var property_suggest_options = { "type" : "/type/property" };

    if ($("#property-search-toggle-commons").is(":checked")) {
      property_suggest_options.mql_filter = MQL_FILTERS.property;
    }

    $property_input.suggest(property_suggest_options)
      .bind("fb-select", function(e, data){
        window.location.href = fb.acre.request.app_url + "/schema" + data.id;
      })
      .focus(function() {
        this.select();
      });

    /*
        USER SUGGEST
    */
/*
    var $user_input = $("#user-search-input");
    var $user_form = $user_input.closest("form");
*/

    /*
        Schema Search Toggles
        On click for radio buttons, we have to update mql_filter params and reinitialize suggest

    */
    $(".search-toggle").click(function(e){
      var $el = $(this);
      var $parent = $(this).parent().siblings("form");

      /*
       We grab the radio buttons closest form
       and compare it's ID to decide which mql_filter
       we need to update.
       */

      // Split ID to compare string
      var el_id = $el.attr("id").split("-");

      // Domain
      if ($parent.attr("id") === $domain_form.attr("id")) {
        if (el_id[el_id.length-1] === "commons") {
          domain_suggest_options.mql_filter = MQL_FILTERS.domain;
        }
        else {
          delete domain_suggest_options.mql_filter;
        }
        $domain_input.suggest(domain_suggest_options);
      }

      // Type
      else if ($parent.attr("id") === $type_form.attr("id")) {
        if (el_id[el_id.length-1] === "commons") {
          type_suggest_options.mql_filter = MQL_FILTERS.type;
        }
        else {
          delete type_suggest_options.mql_filter;
        }
        $type_input.suggest(type_suggest_options);
      }

      // Property
      else if ($parent.attr("id") === $property_form.attr("id")) {
        if (el_id[el_id.length-1] === "commons") {
          property_suggest_options.mql_filter = MQL_FILTERS.property;
        }
        else {
          delete property_suggest_options.mql_filter;
        }
        $property_input.suggest(property_suggest_options);
      }

      // focus related input, preserving user input
      var $text_input = $parent.find(".text-input");
      var search_term = $text_input.val();
      $text_input.val(search_term).focus().trigger(jQuery.Event("keyup"));

    });

  };

  $(init);

})(jQuery, window.freebase);
