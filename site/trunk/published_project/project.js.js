$(document).ready(function(){
    
    // Only load chiclets when needed
    //$("img").lazyload();
  
    // Setup jQuery masonry to handle reflowing of chiclets
    // $("#collections").masonry({animate: true });

    $(".collection-img > a").hover(function(){
        $(this).find('img').animate({left: '0'},{duration:1000}).animate({left:'-604px'},{duration:4500, easing: 'linear'});},function() {
        $(this).find('img').stop(true, true);
        $(this).find('img').animate({left:'0px'},{duration:500, easing: 'swing'});
    });

    $(".collection-show-topics").click(function(){
        var collection_id = $(this).attr("title");
        var $collection = $(this).closest(".collection");
        var $topics = $collection.find(".collection-topics");
        
        if ($topics.is(":hidden")) {
            show_topic_panel($collection, $topics, collection_id);
        }
        else {
            hide_topic_panel($collection);
        }
    });
    
    $(".collection").hover(function() {
        $(this).addClass('collection-active');
    }, function() {
        $(this).removeClass('collection-active');
        hide_topic_panel($(this));
    });
    

    function show_topic_panel(collection, topics, collection_id) {
        $(collection).find(".collection-info").animate({top: '50px'}, 300);
        $(topics).slideDown(300).fadeIn(200);
        $(topics).load("http://published_project.site.freebase.dev.acre.z:8115/collection-topics?id=" + collection_id);    
    }
    
    function hide_topic_panel(collection) {
        
        var $menu = $(collection).find(".collection-info");
        var $topics = $(collection).find(".collection-topics");
        
        if($topics.is(":visible")) {
            $menu.animate({top: '162px'}, 300);
            $topics.slideUp(300).fadeOut(200);        
        }
    }
    
});