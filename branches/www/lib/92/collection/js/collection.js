;(function($, fb) {

  var collection = fb.collection = {

    init_infinitescroll: function() {
      var table = $("#infinitescroll");
      var next = table.attr("data-next");
      if (!next || next === "false") {
        // nothing to scroll
        return;
      }
      var a_next = $("#infinitescroll-next");
      table.infinitescroll({
        loading: {
          msgText: "Fetching more topics",
          img: fb.h.static_url("lib/template/img/horizontal-loader.gif")
        },
        nextSelector: "#infinitescroll-next",
        navSelector: "#infinitescroll-next",
        dataType: "json",
        pathParse: function() {
          return [
            a_next[0].href + "&" + $.param({cursor:table.attr("data-next")}) + "&page=",
            ""
          ];
        },
        appendCallback: false
      }, function(data) {
        data = JSON.parse(data);
        var next = data.result.cursor;
        var html = $(data.result.html);
        collection.init_menus(html);
        collection.load_blurbs(html);
        table.append(html);
        if (next) {
          table.attr("data-next", next);
        }
        else {
          $(window).unbind('.infscr');
        }
      });
      setTimeout(function() {
        $(window).trigger("scroll");
      });
    },

    init_menus: function(context, nicemenu) {
      context = $(context || document);
      if (nicemenu) {
        $(".nicemenu", context).nicemenu();
      }
      var row;
      if (context && context.is(".data-row")) {
        row = context;
      }
      else {
        row = $(".data-row", context);
      }
      row.hover(collection.row_menu_hoverover, collection.row_menu_hoverout);
      $(".nicemenu .headmenu", context)
        .add($(".nicemenu .default-action", context));
    },

    // load collection blurbs client-side
    load_blurbs: function(context) {
      var word_length = 30;
      $(".load-blurb", context).each(function(i, el) {
        var url = [
          fb.acre.freebase.googleapis_url,
          "/text",
           $(el).attr("data-id"),
          "?key=",
          fb.acre.freebase.api_key
        ].join("");
        $.getJSON(url, function(data) {
          var words = data.result.split(/\s+/);
          $(el).text(words.slice(0, word_length).join(" "));
        });
      });
    },

    // show row menu button on hover
    row_menu_hoverover: function(e) {
      var row = $(this);
      collection.row_menu_hoverover.timeout = setTimeout(function() {
        row.addClass("row-hover");
      }, 300);
    },

    // hide row menu button on mouseout
    row_menu_hoverout: function(e) {
      clearTimeout(collection.row_menu_hoverover.timeout);
      var row = $(this);
      row.removeClass("row-hover");
    },

    row_edit: function(context) {
      var prop_row = $(context).parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.ajax_url("lib/collection/collection-edit.mf.js"), function() {
        collection.edit.row_edit_begin(prop_row);
      });
      return false;
    },

    init: function() {
      collection.init_infinitescroll();
      collection.init_menus();
      collection.load_blurbs();
      return collection;
    }

  };

  collection.init();

})(jQuery, window.freebase);
