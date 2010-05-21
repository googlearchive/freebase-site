$(document).ready(function(){
    
    // Only load chiclets when needed
    //$("img").lazyload();
  
    // Setup jQuery masonry to handle reflowing of chiclets
    // $("#collections").masonry({animate: true });

    $(".collection-img > a").hover(function(){
        $(this).find('img').animate({left:'-604px'},{duration:4500, easing: 'linear'});},function() {
        $(this).find('img').stop(true, true);
        $(this).find('img').animate({left:'0px'},{duration:500, easing: 'swing'});
    });

    $(".collection-show-topics").click(function(){
    
    
        var collection_id = $(this).attr("title");
        var $topics = $(this).parent().siblings(".collection-topics");
        var $menu = $(this).closest(".collection-info");
        var $container = $(this).closest(".collection");
        
        if ($topics.is(":hidden")) {
            $menu.animate({top: '50px'}, 300);
            $topics.slideDown(300).fadeIn(200);
            $topics.load("http://published_project.site.freebase.dev.acre.z:8115/collection-topics?id=" + collection_id);
        }

        else {
            $menu.animate({top: '153px'}, 300);
            $topics.slideUp(300).fadeOut(200);
        }
    });
    
    $(".collection").hover(function() {
        $(this).addClass('collection-active');
    }, function() {
        $(this).removeClass('collection-active');
    });
    
});