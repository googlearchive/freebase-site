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

    row_menu_hoverover: function(e) {
      var row = $(this);
      row.addClass("row-hover");
      $(".row-menu-trigger", row).css('visibility','visible');
    },

    row_menu_hoverout: function(e) {
      var row = $(this);
      $(".row-menu-trigger", row).css('visibility','hidden');
      row.removeClass("row-hover");
    },

    init: function() {

      // Update in-page navgiation menu relative
      // to current page viewport
      var $reference = $("#content-wrapper");
      var $menu = $("#content-sub");
      var menu_position_y = $menu.offset().top;
      var reference_offset_y = $reference.offset().top;

      $(window).scroll(function(){
        var scrollTop = $(window).scrollTop();
        if(scrollTop >= reference_offset_y) {
          $menu.css({ "position": "fixed", "right": "30px"});
          $menu.animate({"top": "0"});
        }

        else {
          $menu.css({"position": "absolute", "right": "0", "top": "0"});
        }
      });

      // In-page navigation handling
      var $nav_current = $("#section-nav-current");
      var $nav_menu = $("#section-nav");
      var $nav_menu_trigger = $("#section-nav-current").click(function() {
        if ($nav_menu.is(":visible")) {
          $nav_menu.hide();
        }
        else {
          $nav_menu.show();
        }
      });

      // Update currently selected and hide menu when user clicks
      $("li > a", $nav_menu).click(function(){
        $nav_current.html($(this).html());
        $nav_menu.hide();
      });

      // Hide menu when user leaves menu
      $nav_menu.mouseleave(function(){
        setTimeout(function(){ $nav_menu.fadeOut() }, 1500);
      });

      triples.init_row_menu();

      $.tablesorter.defaults.cssAsc = "column-header-asc";
      $.tablesorter.defaults.cssDesc = "column-header-desc";
      $.tablesorter.defaults.cssHeader =  "column-header";

      // init table sorter
      var table = $(".table-sortable").tablesorter();

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

      // filter creator/user suggest
      $("input[name=creator]").suggest({
        service_url: acre.freebase.service_url,
        type: "/type/user"
      })
      .bind("fb-select", function(e, data) {
        $(this).val(data.id)
          .parents("form:first").submit();
      });



      // article/image tooltips
      triples.article_tip = $("#article-tip");
      triples.image_tip = $("#image-tip");
      var tip_options = {
        "article": {
          tip: triples.article_tip,
          onBeforeShow: function(id) {
            $.ajax({
              url: acre.freebase.service_url + "/api/trans/blurb" + id,
              dataType: "jsonp",
              jsonpCallback: "window.freebase.triples.article_callback"
            });
          }
        },
        "image": {
          tip: triples.image_tip,
          onBeforeShow: function(id) {
            $("img", triples.image_tip).attr("src", acre.freebase.service_url + "/api/trans/raw" + id).show();
          }
        }
      };

      $(".article").add($(".image")).each(function() {
        var trigger = $(this);
        var tip_class = trigger.hasClass("article") ? "article" : "image";
        var tip_option = tip_options[tip_class];
        trigger
          .removeAttr("title")
          .tooltip({
            position: "top center",
            effect: "fade",
            predelay: 500,
            tip: tip_option.tip,
            onBeforeShow: function() {
              var id = this.getTrigger().metadata().id;
              var current_id = tip_option.tip.data("id");
              if (id === current_id) {
                return;
              }
              tip_option.tip.data("id", id);
              tip_option.onBeforeShow(id);
            }
          });
        });
    },

    article_callback: function(data) {
      triples.article_tip.text(data.result.body).show();
    }
  };

  $(triples.init);

})(jQuery, window.freebase);
