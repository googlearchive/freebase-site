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
    $pane.load($tab.attr("href"), function() {
      fb.homepage.init_activity_charts($pane);
      switch_pane();
    });
  } else {
    switch_pane();
  };
});

fb.homepage.init_activity_charts = function(scope) {
  $(".activity-chart", scope).each(function() {
    var $chart = $(this);
    var weeks = JSON.parse($chart.attr("data-activity"));
    var r = Raphael($chart[0]);
    
    r.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";
    
    var x = [], y = [], y2 = [], y3 = [];
    for (var i = 0; i < 500; i++) {
      x[i] = i * 10;
      y[i] = (y[i - 1] || 0) + (Math.random() * 7) - 3;
      y2[i] = (y2[i - 1] || 150) + (Math.random() * 7) - 3.5;
      y3[i] = (y3[i - 1] || 300) + (Math.random() * 7) - 4;
    }
    
    r.g.text(160, 10, "Simple Line Chart");
    
    r.g.linechart(10, 10, 300, 220, x, [y, y2, y3]);
    
  });
};

fb.homepage.init = function() {
  
  $("#domain-explorer-tabs").tabs("#explorer-panes > div", {
    initialIndex: 0,
    effect: "load_pane"
  });
};

setTimeout(fb.homepage.init, 0);

})(jQuery, window.freebase);

