$(document).ready(function(){

    // Setup schema search tabset
    var $schema_explorer_search_tabset = $("#schema-search > .section-tabset").tabs("#schema-search > .search-box");
    
    // Make all sortable tables sortable
    $(".table-sortable").tablesorter({
        cssAsc: "column-header-asc",
        cssDesc: "column-header-desc",
        cssHeader: "column-header",
        sortList: [[0,0]]
    });

    // trigger for row menus
    $(".row-menu-trigger").each(function(){

        var $tooltip = $(this).tooltip({
            events: {def: "click,mouseout"},
            position: "bottom right",
            offset: [-10, -10],
            effect: "fade",
            delay: 300
        });
        
        $menu = $(this).closest(".row-menu");
        $menu.children().last().hide();
        
    });
    
    /*
        Breadcrumbs
    */
    
    // Offset the breadcrumb menu equivalent to the width of the trigger
    h_width = $(".breadcrumb-sibling-trigger").outerWidth();
    h_offset = (h_width);
    
    $(".breadcrumb-sibling-trigger").tooltip({
        events: {def: "click,mouseout"},
        position: "bottom right",
        offset: [-5, -h_offset],
        effect: "fade",
        delay: 300,
        onBeforeShow: function(){
            this.getTrigger().addClass("active");
        },
        onHide: function() {
            this.getTrigger().removeClass("active");        
        }
        
    });
    
    // we use 'visibillity' here to prevent table shifting when shown
    $(".row-menu-trigger").css({"visibility":"hidden"});
    
    $(".hoverable").hover(function(){
        $row = $(this).addClass("row-hover");
        $menu_trigger = $row.find(".row-menu-trigger").css('visibility','visible').hide().fadeIn("fast");
    }, function(){
        $menu_trigger.css("visibility", "hidden");
        $row.removeClass("row-hover");
    });


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
            $trigger.addClass("expanded")
            $tbody.slideDown();
            $row.addClass("expanded")
        }
        else {
            $trigger.removeClass("expanded");
            $tbody.slideUp();
            $row.removeClass("expanded");
        }
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
    }
 
    /* 
        DOMAIN SUGGEST
    */
    var $domain_input = $("#domain-search-input");
    var $domain_form = $domain_input.closest("form");
    
    var domain_suggest_options = { "type" : "/type/domain" };
    
    if ($("#domain-search-toggle-commons").is(":checked")) {
        domain_suggest_options.mql_filter = MQL_FILTERS.domain;
    }

    $domain_input.suggest(domain_suggest_options)
    .bind("fb-select", function(e, data){
        var url = $domain_form.attr("action");       
        window.location.href = url + data.id;
    })
    .focus(function() {
        this.select();
    });
    
    /*
        TYPE SUGGEST
    */
    var $type_input = $("#type-search-input");
    var $type_form = $type_input.closest("form");

    var type_suggest_options = { "type" : "/type/type" };

    if ($("#type-search-toggle-commons").is(":checked")) {
        type_suggest_options.mql_filter = MQL_FILTERS.type;
    }
    
    $type_input.suggest(type_suggest_options)
   .bind("fb-select", function(e, data){
        var url = $type_form.attr("action");
        window.location.href = url + data.id;
    })
    .focus(function() {
        this.select();
    });

    /*
        PROPERTY SUGGEST
    */
    var $property_input = $("#property-search-input");
    var $property_form = $property_input.closest("form");
    
    var property_suggest_options = { "type" : "/type/property" };

    if ($("#property-search-toggle-commons").is(":checked")) {
        property_suggest_options.mql_filter = MQL_FILTERS.property;
    }
    
    $property_input.suggest(property_suggest_options)
   .bind("fb-select", function(e, data){
        var url = $property_form.attr("action");
        window.location.href = url + data.id;
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

        $el = $(this);
        $parent = $(this).parent().siblings("form");
        
    
        // focus related input
        var $text_input = $parent.find(".text-input").focus();
        
        /*
            We grab the radio buttons closest form
            and compare it's ID to decide which mql_filter
            we need to update.
        */
        
        // Split ID to compare string
        el_id = $el.attr("id").split("-");
        
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
        if ($parent.attr("id") === $type_form.attr("id")) {
        
            if (el_id[el_id.length-1] === "commons") {            
                type_suggest_options.mql_filter = MQL_FILTERS.type;
            }
            else {
                delete type_suggest_options.mql_filter;
            }

            $type_input.suggest(type_suggest_options);
        }
        
        // Property
        if ($parent.attr("id") === $property_form.attr("id")) {

            if (el_id[el_id.length-1] === "commons") {            
                property_suggest_options.mql_filter = MQL_FILTERS.property;
            }
            else {
                delete property_suggest_options.mql_filter;
            }
            
            $property_input.suggest(property_suggest_options);

        }

    });

});


// We have to force the digit parser to ignore commas for proper sorting on high instance counts
// See http://www.barneyb.com/barneyblog/2009/06/03/jquery-tablesorter-comma-parser/
jQuery.tablesorter.addParser({
  id: "commaDigit",
  is: function(s, table) {
    var c = table.config;
    return jQuery.tablesorter.isDigit(s.replace(/,/g, ""), c);
  },
  format: function(s) {
    return jQuery.tablesorter.formatFloat(s.replace(/,/g, ""));
  },
  type: "numeric"
});