(function($, fb) {

fb.homepage = {};

fb.homepage.init = function() {
  
  $("#domain-explorer-tabs").tabs("#explorer-panes > div", {
    effect: "ajax",
    initialIndex: 0
  });

};

setTimeout(fb.homepage.init, 0);

})(jQuery, window.freebase);

