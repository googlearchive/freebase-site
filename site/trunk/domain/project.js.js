$(document).ready(function(){

    var fb = {}
    
    // Only load chiclets when needed
    $("img").lazyload({
        effect : "fadeIn"
    });
  
    // Setup jQuery masonry to handle reflowing of chiclets
    $("#collections").masonry({animate: true });

    // We animate the chiclet on hover after 1 second, and return to 0 on mouseout
    $(".collection-img > a").hover(function(){
        $(this).find('img').animate({left: '0'},{duration:1000}).animate({left:'-604px'},{duration:4500, easing: 'linear'});},function() {
        $(this).find('img').stop(true, false);
        $(this).find('img').animate({left:'0px'},{duration:500, easing: 'swing'});
    });

    $(".collection-show-topics").click(function(){
    
        // Basic UI state management for collection topics
        var $link = $(this);
        var collection_id = $(this).attr("title");
        var $collection = $(this).closest(".collection");
        var $topics = $collection.find(".collection-topics");
        var query_state = $(this).attr("data-fb-query");
        
        // If topics panel is hidden, we need to query for topics and show
        if ($topics.is(":hidden")) {
            $(this).addClass("expanded");
            fb.show_topic_panel($link, $collection, $topics, collection_id, query_state);
        }
        else {
            $(this).removeClass("expanded");
            fb.hide_topic_panel($collection);
        }
    });
    
    // Add active class to hovered collection &
    // Remove active class and hide topics on mouseout
    $(".collection").hover(function() {
        $(this).addClass('collection-active');
    }, function() {
        $(this).removeClass('collection-active');
        $(this).find(".collection-show-topics").removeClass("expanded");
        fb.hide_topic_panel($(this));
    });
    
    // Function for showing topics panel
    fb.show_topic_panel = function ($link, $collection, $topics, collection_id, query_state) {
        $collection.find(".collection-info").animate({top: '50px'}, 300);
        $topics.slideDown(300).fadeIn(200);
        if(query_state == "false") {
            $topics.addClass("loading");
            $.ajax({
                url: "http://domain.site.freebase.dev.acre.z:8115/collection-topics?id=" + collection_id,
                success: function(data) {
                    $topics.removeClass("loading").prepend(data);
                    $more = $topics.find(".collection-view-all").show();
                    $link.attr("data-fb-query", "true");
                }
            });        
        }
    }
    
    // Function for hiding topics panel
    fb.hide_topic_panel = function(collection) {
        var $menu = $(collection).find(".collection-info");
        var $topics = $(collection).find(".collection-topics");
        if($topics.is(":visible")) {
            $menu.animate({top: '162px'}, 300);
            $topics.slideUp(300).fadeOut(200);        
        }
    }
});