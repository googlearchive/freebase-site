$(document).ready(function(){
    
    // Only load chiclets when needed
    $("img").lazyload();
  
    // Setup jQuery masonry to handle reflowing of chiclets
    $("#collections").masonry({animate: true });

    $(".collection-img > a").hover(function(){
        $(this).find('img').animate({left:'-604px'},{duration:4000, easing: 'linear'});},function() {
        $(this).find('img').stop(true, true);
        $(this).find('img').animate({left:'0px'},{duration:500, easing: 'swing'});
    });

    $(".collection-show-topics").click(function(){
        $topics = $(this).parent().siblings(".collection-topics");
        $menu = $(this).closest(".collection-info");
        if ($topics.is(":hidden")) {
            $menu.animate({top: '50px'}, 300);
            $topics.slideDown(300).fadeIn(200);
        }
        else {
            $menu.animate({top: '153px'}, 300);
            $topics.slideUp(300).fadeOut(200);
        }
    });
});
