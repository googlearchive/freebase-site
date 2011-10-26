;(function($, fb) {

  var collection = fb.collection = {
    
    init_infinitescroll: function() {
      var table = $("#infinitescroll");
      var next = table.attr("data-next");
      if (!next) {
        // nothing to scroll
        return;
      }
      var a_next = $("#infinitescroll-next");
      table.infinitescroll({
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
        i18n.ize(html);
        table.append(html);
        if (next) {
          table.attr("data-next", next);
        }
        else {
          $(window).unbind('.infscr');
        }
      });
    },
    
    init: function() {
      collection.init_infinitescroll();
      return collection;
    }
    
  };

})(jQuery, window.freebase);