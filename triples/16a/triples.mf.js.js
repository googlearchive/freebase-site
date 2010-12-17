
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Additional Licenses for Third Party components can be found here:
 * http://wiki.freebase.com/wiki/Freebase_Site_License
 *
 */
(function(b,k){var a=k.triples={tip:null,build_query:null,build_query_url:null,init_row_menu:function(d){a.tip=b("#triple-tip");a.build_query=b("#build-query");a.build_query_url=a.build_query.attr("href");b(".row-menu-trigger",d).each(function(){var f=b(this);f.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300,tip:"#triple-tip",onBeforeShow:function(){var c=this.getTrigger().parents("tr:first").metadata();a.build_query.attr("href",a.build_query_url+
"?q="+c.mql)}});f.parents("tr:first").hover(a.row_menu_hoverover,a.row_menu_hoverout)})},row_menu_hoverover:function(){var d=b(this);d.addClass("row-hover");b(".row-menu-trigger",d).css("visibility","visible")},row_menu_hoverout:function(){var d=b(this);b(".row-menu-trigger",d).css("visibility","hidden");d.removeClass("row-hover")},update_menu:function(){var d=a.last_position||0,f=b(window).scrollTop(),c=null;b(window).scrollTop();var e=b("b","#section-nav-current"),h=b("#section-nav-current");if(f>
d)a.menu_map_order.forEach(function(i){if(a.menu_map[i]<f)c=i});else for(d=a.menu_map_order.length-1;d>=0;d--){var g=a.menu_map_order[d];if(f<a.table_map[g])c=g}if(c!=null){g=".toc-"+c+"> a";d=b("b",h).html();g=b(g).html();if(d!=g){e.html(g);a.last_position=f;h.effect("highlight",{color:"#ececec"},500)}}},limit_slider:function(){var d=b("#limit-slider"),f=b(".filter-title > .current-limit"),c=d.siblings("input[name=limit]"),e=100,h=window.location.href.slice(window.location.href.indexOf("?")+1).split("&");
if(window.location.href.split("?")!=h[0])for(var g=h.length,i=0;i<g;i++){param=h[i].split("=");if(param[0]==="limit")e=param[1]}d.slider({value:e,min:1,max:1E3,step:10,slide:function(l,j){f.css({color:"#f71"});f.html(j.value)},stop:function(l,j){f.css({color:"#333"});c.val(j.value);j.value!=e&&d.parents("form:first").submit()}})},update_menu_position:function(){var d=a.viewport.height(),f=a.menu.height();if(d>f)if(b(window).scrollTop()>=a.reference_offset_y){a.menu.css({position:"fixed",right:"30px"});
a.menu.animate({top:"0"})}else a.menu.css({position:"absolute",right:"0",top:"0"})},init:function(){a.init_row_menu();a.limit_slider();b.tablesorter.defaults.cssAsc="column-header-asc";b.tablesorter.defaults.cssDesc="column-header-desc";b.tablesorter.defaults.cssHeader="column-header";b(".table-sortable").tablesorter();b(".filter-form-trigger, .time-form-trigger").click(function(){var c=b(this).siblings(".filter-form");c.is(":hidden")?c.slideDown(function(){b(":text:first",c).focus()}):c.slideUp()});
b(":text[name=domain], :text[name=type], :text[name=property]").suggest({service_url:k.acre.freebase.site_host,type:["/type/domain","/type/type","/type/property"],type_strict:"any"}).bind("fb-select",function(c,e){var h=b(this);h.val(e.id);var g=e["n:type"].id;if(g==="/type/domain")h.attr("name","domain");else if(g==="/type/type")h.attr("name","type");else g==="/type/property"&&h.attr("name","property");h.parents("form:first").submit()});b(":text[name=creator]").suggest({service_url:k.acre.freebase.site_host,
type:"/type/user"}).bind("fb-select",function(c,e){b(this).val(e.id).parents("form:first").submit()});var d=b("#content-sub").height()+b("#page-footer").height();b("#content-main").css({"min-height":d});a.viewport=b(window);a.reference=b("#content-wrapper");a.menu=b("#content-sub");a.menu_position_y=a.menu.offset().top;a.reference_offset_y=a.reference.offset().top;a.nav_current=b("#section-nav-current");a.nav_menu=b("#section-nav");a.menu_map={};a.menu_map_order=[];a.table_map={};b(".table-title > a").each(function(){var c=
b(this),e=c.offset().top;c=c.attr("name");a.menu_map[c]=e;e=b("[name="+c+"]").parent().next("table");a.table_map[c]=e.offset().top+e.height()-20;a.menu_map_order.push(c)});var f=null;b(window).scroll(function(){clearTimeout(f);f=setTimeout(a.update_menu,200);a.update_menu_position()});b(window).resize(function(){a.update_menu_position()});b("#section-nav-current").click(function(){a.nav_menu.is(":visible")?a.nav_menu.hide():a.nav_menu.show()});a.nav_menu.mouseleave(function(){setTimeout(function(){a.nav_menu.fadeOut()},
1500)});b("li > a",a.nav_menu).click(function(){b("b",a.nav_current).html(b(this).html());a.nav_menu.hide()});b(".history-toggle").change(function(){var c=b(this).parents("form:first"),e=b(this);e.val()==="true"?e.val("false"):e.val("true");c.submit()})}};b(a.init)})(jQuery,window.freebase);
