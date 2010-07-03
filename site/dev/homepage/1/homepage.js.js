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
  $(".activity-chart-assertions", scope).each(function() {
    var $chart = $(this);
    var weeks = JSON.parse($chart.attr("data-activity"));
    var r = Raphael($chart[0], $chart.width(), $chart.height());
    
    var x = [], edits = [];
    for (var i = 0; i < weeks.length; i++) {
      x[i] = i * 10;
      edits.push(parseInt(weeks[i].e, 10));
    }
    
    r.g.linechart(-2, 0, 150, 40, x, [edits], {colors: ["#c60"]});
  });
  
  $(".activity-chart-coverage", scope).each(function() {
    var $chart = $(this);
    var weeks = JSON.parse($chart.attr("data-activity"));
    var r = Raphael($chart[0], $chart.width(), $chart.height());
    
    var fill_percentage = [], total_amount = [];
    for (var i = 0; i < weeks.length; i++) {
      var capacity = parseInt(weeks[i].c, 10);
      var fill = parseInt(weeks[i].f, 10);
      fill_percentage.push(fill);
      total_amount.push(capacity - fill);
    }
    
    r.g.barchart(3, -10, 150, 70, 
                 [fill_percentage, total_amount], 
                 {stacked: true, colors: ["#669", "#ccc"]});
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

