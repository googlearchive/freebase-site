(function($, fb) {

fb.homepage = {};

$.tools.tabs.addEffect("load_pane", function(i, done) {
  var $panes = this.getPanes();
  var $pane = $panes.eq(i);
  var $tab = this.getTabs().eq(i);
  
  function crossfade() {
    $panes.fadeOut("fast");
    $pane.fadeIn(done);
  }
  
  // only load the pane once
  if ($pane.is(":empty") || $.trim($pane.text()).length == 0) {
    // load it with a page specified in the tab's href attribute
    $pane.load($tab.attr("href"), crossfade);
  } else {
    crossfade();
  };
});

fb.homepage.init = function() {
  
  $("#domain-explorer-tabs").tabs("#explorer-panes > div", {
    initialIndex: 0,
    effect: "load_pane"
  });

};

setTimeout(fb.homepage.init, 0);

})(jQuery, window.freebase);

