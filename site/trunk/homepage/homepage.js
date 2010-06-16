(function($, fb) {

fb.homepage = {};

fb.homepage.init = function() {
    // Initialize Domain Explorer tabset
    $tabset = $("#domain-explorer-tabset").parent().tabs({
        selected: 0, spinner: '<em>&nbsp;</em>',
        fx: {opacity: 'toggle'},
        load: fb.explore._updateTabs
    })
    .bind('tabsshow', fb.homepage._tabsshowHandler);
    
    //Once tabset is ready, we need to highlight currently selected tab
    //The tabs() plugin actually handles this, but we are peforming custom
    //animation for the selected state, handled in fb.explore._updateTabs
    //We also need to handle the "All" case, which doesn't have a load event
    //Since it it not called with AJAX
    $tabset.ready(fb.homepage._updateTabs);
    $("#all-domains-tab").click(fb.homepage._updateTabs);
    
    // Equalize heights of domain explorer panels
    $("#domain-explorer-tabs, #domain-explorer-tabset > .ui-tabs-panel").equalizeCols();
};

fb.homepage._tabsshowHandler = function(event, ui) {
    $("#domain-explorer-tabs, #domain-explorer-tabset > .ui-tabs-panel").equalizeCols();
};

fb.homepage._updateTabs = function(e, ui) {
    // First, figure out the selected tab and it's position
    var selected_tab_index = $(tabset).tabs('option', 'selected');
    var selected_tab = $("#domain-explorer-tabs > li:eq(" + selected_tab_index + ") > a");
    var selected_tab_position = selected_tab.position();
    
    // Update pointer text and position accordingly
    var pointer_text = selected_tab.text();
    $("#pointer-text").fadeOut(function() { $("#pointer-text").html(pointer_text); });
    $("#pointer").fadeIn().animate({'top': selected_tab_position.top + 'px' },
                                   function() { $("#pointer-text").fadeIn(); });

};

setTimeout(fb.homepage.init, 0);

})(jQuery, window.freebase);

