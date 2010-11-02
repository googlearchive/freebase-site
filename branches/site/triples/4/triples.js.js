(function($, fb) {


  var triples = fb.triples = {
    tip: null,
    build_query: null,
    build_query_url: null,

    // trigger for row menus
    init_row_menu: function(context) {
      triples.tip = $("#triple-tip");
      triples.build_query = $("#build-query");
      triples.build_query_url = triples.build_query.attr("href");

      $(".row-menu-trigger", context).each(function(){
        var trigger = $(this);
        trigger.tooltip({
          events: {def: "click,mouseout"},
          position: "bottom right",
          offset: [-10, -10],
          effect: "fade",
          delay: 300,
          tip: "#triple-tip",
          onBeforeShow: function() {
            var triple = this.getTrigger().parents("tr:first").metadata();
            triples.build_query.attr("href", triples.build_query_url + "?q=" + triple.mql);
          }
        });
        trigger.parents("tr:first").hover(triples.row_menu_hoverover, triples.row_menu_hoverout);
      });
    },

    // show row menu button on hover
    row_menu_hoverover: function(e) {
      var row = $(this);
      row.addClass("row-hover");
      $(".row-menu-trigger", row).css('visibility','visible');
    },

    // hide row menu button on mouseout
    row_menu_hoverout: function(e) {
      var row = $(this);
      $(".row-menu-trigger", row).css('visibility','hidden');
      row.removeClass("row-hover");
    },

    // Update right-hand menu item based on current scroll position
    update_menu: function() {
      var last_position = triples.last_position || 0;
      var current_position = $(window).scrollTop();
      var current_menu_item = null;
      var scrollTop = $(window).scrollTop();
      var $label = $("b", "#section-nav-current");
      var $current_display_label = $("#section-nav-current");

      // scroll down
      if (current_position > last_position) {
        triples.menu_map_order.forEach(function(key){
          var menu_offset = triples.menu_map[key];
          // scrolling down
          if (menu_offset < current_position) {
            current_menu_item = key;
          }
        });
      }
      // scroll up
      else {
        for (var i=triples.menu_map_order.length-1; i>=0; i--) {
          var key = triples.menu_map_order[i];
          var offset = triples.table_map[key];
          if (current_position < offset) {
            current_menu_item = key;
          }
        }
      }

      // If the scroll position enters a new section
      // update the in-page menu
      if (current_menu_item != null) {
        var selector = ".toc-" + current_menu_item + "> a";
        var current_menu_label = $("b", $current_display_label).html();
        var new_menu_label = $(selector).html();
        if (current_menu_label != new_menu_label) {
          $label.html(new_menu_label);
          triples.last_position = current_position;
          $current_display_label.effect("highlight", {'color' : '#ececec'}, 500);
        }
      }
    },

    limit_slider: function() {
                  
      // slider for controlling property limit
      var $limit_slider = $("#limit-slider");
      var $current_limit = $(".filter-title > .current-limit");
      var $input = $limit_slider.siblings("input[name=limit]");
      var slider_value = 100;

      // get current url params
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      var current_url = window.location.href.split("?");

      // if we have url params, check if one of them is limit
      if(current_url != hashes[0]) {
        var count = hashes.length;
        for(var i=0; i < count; i++) {
          param = hashes[i].split("=");
          if(param[0] === "limit") {
            var slider_value = param[1];
          }
        }
      }
      
      $limit_slider.slider({
        value: slider_value,
        min: 1,
        max: 1000,
        step: 10,
        slide: function(e, ui) {
          $current_limit.css({'color': '#f71'});
          $current_limit.html(ui.value);
        },
        stop: function(e, ui) {
          $current_limit.css({'color': '#333'});
          $input.val(ui.value);
          $limit_slider.parents("form:first").submit();
        }
      });

    },


    init: function() {

      // Initialize row menu hovers & menus
      triples.init_row_menu();

      // Initialize the property limit slider
      triples.limit_slider();

      // Initialize table sorting
      $.tablesorter.defaults.cssAsc = "column-header-asc";
      $.tablesorter.defaults.cssDesc = "column-header-desc";
      $.tablesorter.defaults.cssHeader =  "column-header";

      var table = $(".table-sortable").tablesorter();

      // *** Initialize triggers for showing/hiding hidden inputs
      $(".filter-form-trigger").click(function(){
        var $form = $(this).siblings(".filter-form");
        if($form.is(":hidden")) {
          $form.slideDown(function() {
            $(":text:first", $form).focus();
          });
        }
        else {
          $form.slideUp();
        }
      });

      // *** Initialize user/creator suggest input
      $("input[name=creator]").suggest({
        service_url: fb.acre.freebase.service_url,
        type: "/type/user"
      })
      .bind("fb-select", function(e, data) {
        $(this).val(data.id)
          .parents("form:first").submit();
      });
      
      // *** Initialize filter menu positioning
      // Because the filter menu is absolutely/fixed positioned
      // we need to insure the content container is at least the
      // same height as the menu
      var target_height = $("#content-sub").height() + $("#page-footer").height();
      $("#content-main").css({"min-height": target_height});

      /*
      **************************************************
      ** Update in-page navgiation menu               **
      ** (1) Update Position of menu                  **
      ** (2) Update currently active section          **
      **************************************************
      */

      var $reference = $("#content-wrapper"); // This is the effective starting point of 'content'
      var $menu = $("#content-sub"); // The menu item
      var menu_position_y = $menu.offset().top; // Starting vertical offset of menu object
      var reference_offset_y = $reference.offset().top; // Starting vertical offset of content
      var $nav_current = $("#section-nav-current"); // The currently selected section
      var $nav_menu = $("#section-nav"); // The navigation menu for jumping between sections


      // Build a map of vertical offsets for each section
      // Use this to compare against current scroll position
      triples.menu_map = {};
      triples.menu_map_order = [];
      triples.table_map = {};

      // Iterate through the existing page sections
      // For each section found out it's offset relative
      // to the viewport and add it to the map for later
      // comparison
      $(".table-title > a").each(function(){
        var $target = $(this);
        var target_offset = $target.offset().top;
        var target_name = $target.attr("name");
        triples.menu_map[target_name] = target_offset;
        var table = $("[name=" + target_name + "]").parent().next("table");
        triples.table_map[target_name] = table.offset().top + table.height() - 20;
        triples.menu_map_order.push(target_name);
      });

      var update_menu_timeout = null;

      $(window).scroll(function(){
        clearTimeout(update_menu_timeout);
        update_menu_timeout = setTimeout(triples.update_menu, 200);

        // Set the menu to position fixed once the page
        // is scrolled past the first main section
        // other wise reset it to default
        var scrollTop = $(window).scrollTop();
        if(scrollTop >= reference_offset_y) {
          $menu.css({ "position": "fixed", "right": "30px"});
          $menu.animate({"top": "0"});
        }

        else {
          $menu.css({"position": "absolute", "right": "0", "top": "0"});
        }
      });

      // In-page navigation toggle
      var $nav_menu_trigger = $("#section-nav-current").click(function() {
        if ($nav_menu.is(":visible")) {
          $nav_menu.hide();
        }
        else {
          $nav_menu.show();
        }
      });

      // Toggling for 'show all writes'
      $(".history-toggle").change(function() {

        if($(this).is(":checked")) {
          $(this).val('false');
          $(this).parents("form:first").submit();
        }
        else {
          $(this).val('true');
          $(this).parents("form:first").submit();
        }
      });

      // Hide menu when user leaves menu
      $nav_menu.mouseleave(function(){
        setTimeout(function(){ $nav_menu.fadeOut() }, 1500);
      });

      // Update currently selected and hide menu when user clicks
      $("li > a", $nav_menu).click(function(){
       $("b", $nav_current).html($(this).html());
        $nav_menu.hide();
      });
    }
  };

  $(triples.init);

})(jQuery, window.freebase);
