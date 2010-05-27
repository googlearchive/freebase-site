$(document).ready(function(){
    
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
        var collection_id = $(this).attr("title");
        var $collection = $(this).closest(".collection");
        var $topics = $collection.find(".collection-topics");
        
        if ($topics.is(":hidden")) {
            $(this).addClass("expanded");
            show_topic_panel($collection, $topics, collection_id);
        }
        else {
            $(this).removeClass("expanded");
            hide_topic_panel($collection);
        }
    });
    
    // Add active class to hovered collection &
    // Remove active class and hide topics on mouseout
    $(".collection").hover(function() {
        $(this).addClass('collection-active');
    }, function() {
        $(this).removeClass('collection-active');
        $(this).find(".collection-show-topics").removeClass("expanded");
        hide_topic_panel($(this));
    });
    
    // Function for showing topics panel
    function show_topic_panel(collection, topics, collection_id) {
        $(collection).find(".collection-info").animate({top: '50px'}, 300);
        $(topics).slideDown(300).fadeIn(200).addClass("loading");
        $.ajax({
            url: "http://domain.site.freebase.dev.acre.z:8115/collection-topics?id=" + collection_id,
            success: function(data) {
                $(topics).removeClass("loading").html(data);
            }
        });
    }
    
    // Function for hiding topics panel
    function hide_topic_panel(collection) {
        var $menu = $(collection).find(".collection-info");
        var $topics = $(collection).find(".collection-topics");
        if($topics.is(":visible")) {
            $menu.animate({top: '162px'}, 300);
            $topics.slideUp(300).fadeOut(200);        
        }
    }
});