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
  
  function update_pointer() {
      // First, figure out the selected tab and it's position
      var tab_position = $tab.position();
      
      // Update pointer text and position accordingly
      var pointer_text = $tab.text();
      $("#pointer-text").fadeOut(function() {$("#pointer-text").html(pointer_text);});
      $("#pointer").fadeIn().animate({'top': tab_position.top + 'px' },
                                     function() {$("#pointer-text").fadeIn();});
  }
  
  function switch_pane() {
    $tab.parent().removeClass("processing");
    crossfade();
    update_pointer();
  }
  
  // only load the pane once
  if ($pane.is(":empty") || $.trim($pane.text()).length == 0) {
    // load it with a page specified in the tab's href attribute
    $tab.parent().addClass("processing");
    $pane.load($tab.attr("href"), switch_pane);
  } else {
    switch_pane();
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

