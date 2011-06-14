
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
/*
 
 jQuery Tools @VERSION Tabs- The basics of UI design.

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tabs/

 Since: November 2008
 Date: @DATE 
 
 jQuery Tools @VERSION Tooltip - UI essentials

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tooltip/

 Since: November 2008
 Date: @DATE 
*/
(function(a){a.fn.showRow=function(k,n,g){n=n==="fadeIn"?"fadeIn":"slideDown";var c=this;return this.each(function(){var b=a(this).hide(),d=a("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();b.show();d[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});k&&k.call(c)})})};a.fn.hideRow=function(k,n,g){n=n==="fadeOut"?"fadeOut":"slideUp";var c=this;return this.each(function(){var b=a(this).show(),d=a("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});b.hide();k&&k.call(c)})})}})(jQuery);
(function(a){function k(c,b,d){var f=this,h=c.add(this),j=c.find(d.tabs),o=b.jquery?b:c.children(b),p;j.length||(j=c.children());o.length||(o=c.parent().find(b));o.length||(o=a(b));a.extend(this,{click:function(i,e){var l=j.eq(i);if(typeof i=="string"&&i.replace("#","")){i=i.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");l=j.filter("[href*="+i.replace("#","")+"]");i=Math.max(j.index(l),0)}if(d.rotate){var s=j.length-1;if(i<0)return f.click(s,e);if(i>s)return f.click(0,
e)}if(!l.length){if(p>=0)return f;i=d.initialIndex;l=j.eq(i)}if(i===p)return f;e=e||a.Event();e.type="onBeforeClick";h.trigger(e,[i]);if(!e.isDefaultPrevented()){n[d.effect].call(f,i,function(){e.type="onClick";h.trigger(e,[i])});p=i;j.removeClass(d.current);l.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return j},getPanes:function(){return o},getCurrentPane:function(){return o.eq(p)},getCurrentTab:function(){return j.eq(p)},getIndex:function(){return p},next:function(){return f.click(p+
1)},prev:function(){return f.click(p-1)},destroy:function(){j.unbind(d.event).removeClass(d.current);o.find("a[href^=#]").unbind("click.T");return f}});a.each("onBeforeClick,onClick".split(","),function(i,e){a.isFunction(d[e])&&a(f).bind(e,d[e]);f[e]=function(l){a(f).bind(e,l);return f}});if(d.history&&a.fn.history){a.tools.history.init(j);d.event="history"}j.each(function(i){a(this).bind(d.event,function(e){f.click(i,e);return e.preventDefault()})});o.find("a[href^=#]").bind("click.T",function(i){f.click(a(this).attr("href"),
i)});if(location.hash)f.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)f.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(c,b){n[c]=b}};var n={"default":function(c,b){this.getPanes().hide().eq(c).show();b.call()},fade:function(c,b){var d=this.getConf(),f=d.fadeOutSpeed,h=this.getPanes();f?h.fadeOut(f):
h.hide();h.eq(c).fadeIn(d.fadeInSpeed,b)},slide:function(c,b){this.getPanes().slideUp(200);this.getPanes().eq(c).slideDown(400,b)},ajax:function(c,b){this.getPanes().eq(0).load(this.getTabs().eq(c).attr("href"),b)}},g;a.tools.tabs.addEffect("horizontal",function(c,b){g||(g=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(c).animate({width:g},function(){a(this).show();b.call()})});a.fn.tabs=function(c,b){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(a.isFunction(b))b={onBeforeClick:b};b=a.extend({},a.tools.tabs.conf,b);this.each(function(){d=new k(a(this),c,b);a(this).data("tabs",d)});return b.api?d:this}})(jQuery);
(function(a){function k(c,b,d){var f=d.relative?c.position().top:c.offset().top,h=d.relative?c.position().left:c.offset().left,j=d.position[0];f-=b.outerHeight()-d.offset[0];h+=c.outerWidth()+d.offset[1];var o=b.outerHeight()+c.outerHeight();if(j=="center")f+=o/2;if(j=="bottom")f+=o;j=d.position[1];c=b.outerWidth()+c.outerWidth();if(j=="center")h-=c/2;if(j=="left")h-=c;return{top:f,left:h}}function n(c,b){var d=this,f=c.add(d),h,j=0,o=0,p=c.attr("title"),i=g[b.effect],e,l=c.is(":input"),s=l&&c.is(":checkbox, :radio, select, :button, :submit"),
u=c.attr("type"),r=b.events[u]||b.events[l?s?"widget":"input":"def"];if(!i)throw'Nonexistent effect "'+b.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;c.bind(r[0],function(m){clearTimeout(j);if(b.predelay)o=setTimeout(function(){d.show(m)},b.predelay);else d.show(m)}).bind(r[1],function(m){clearTimeout(o);if(b.delay)j=setTimeout(function(){d.hide(m)},b.delay);else d.hide(m)});if(p&&b.cancelDefault){c.removeAttr("title");c.data("title",p)}a.extend(d,{show:function(m){if(!h){if(p)h=
a(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(p);else if(b.tip)h=a(b.tip).eq(0);else{h=c.next();h.length||(h=c.parent().next())}if(!h.length)throw"Cannot find tooltip for "+c;}if(d.isShown())return d;h.stop(true,true);var q=k(c,h,b);m=m||a.Event();m.type="onBeforeShow";f.trigger(m,[q]);if(m.isDefaultPrevented())return d;q=k(c,h,b);h.css({position:"absolute",top:q.top,left:q.left});e=true;i[0].call(d,function(){m.type="onShow";e="full";f.trigger(m)});q=b.events.tooltip.split(/,\s*/);
h.bind(q[0],function(){clearTimeout(j);clearTimeout(o)});q[1]&&!c.is("input:not(:checkbox, :radio), textarea")&&h.bind(q[1],function(t){t.relatedTarget!=c[0]&&c.trigger(r[1].split(" ")[0])});return d},hide:function(m){if(!h||!d.isShown())return d;m=m||a.Event();m.type="onBeforeHide";f.trigger(m);if(!m.isDefaultPrevented()){e=false;g[b.effect][1].call(d,function(){m.type="onHide";e=false;f.trigger(m)});return d}},isShown:function(m){return m?e=="full":e},getConf:function(){return b},getTip:function(){return h},
getTrigger:function(){return c}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(m,q){a.isFunction(b[q])&&a(d).bind(q,b[q]);d[q]=function(t){a(d).bind(q,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(c,b,d){g[c]=[b,d]}};var g={toggle:[function(c){var b=this.getConf(),d=this.getTip();b=b.opacity;b<1&&d.css({opacity:b});d.show();c.call()},function(c){this.getTip().hide();c.call()}],fade:[function(c){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,c)},function(c){this.getTip().fadeOut(this.getConf().fadeOutSpeed,c)}]};a.fn.tooltip=function(c){var b=this.data("tooltip");if(b)return b;c=a.extend(true,{},a.tools.tooltip.conf,c);
if(typeof c.position=="string")c.position=c.position.split(/,?\s/);this.each(function(){b=new n(a(this),c);a(this).data("tooltip",b)});return c.api?b:this}})(jQuery);
(function(a,k){var n=k.schema={init_row_menu:function(g){a(".row-menu-trigger",g).each(function(){var c=a(this);c.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});c.parents("tr:first").hover(n.row_menu_hoverover,n.row_menu_hoverout)})},row_menu_hoverover:function(){var g=a(this);g.addClass("row-hover");a(".row-menu-trigger",g).css("visibility","visible")},row_menu_hoverout:function(){var g=a(this);a(".row-menu-trigger",g).css("visibility","hidden");
g.removeClass("row-hover")},close_message:function(g,c){var b=a(this).parents(c);b.is("tr")?b.hideRow(function(){b.remove()}):b.slideUp(function(){b.remove()});return false},init_modal_help:function(g){a(".modal-help-toggle",g).click(function(){var c=a(this),b=c.parents().find(".modal-help"),d=c.parents().find(".modal-content");if(b.is(":hidden")){b.height(d.height()-5).slideDown();c.html("[ - ] Hide Help")}else{b.slideUp();c.html("[ + ] Show Help")}})}};a(function(){n.init_row_menu();var g=a(".breadcrumb-sibling-trigger").outerWidth();
a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-g],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
(function(a,k){k.user?a("#create-new-domain").show():a(window).bind("fb.user.signedin",function(){a("#create-new-domain").show()});k.schema.index={add_domain:function(){var n=a(this);k.get_script(k.h.static_url("index-edit.mf.js"),function(){k.schema.index.edit.add_domain_begin(n)});return false}};a(function(){var n=a(".table-sortable");a("thead th:nth-child(2)",n)[0].count=1;a("thead th:nth-child(3)",n)[0].count=1;a("thead th:nth-child(4)",n)[0].count=1;a("#schema-search > .section-tabset").tabs("#schema-search > .search-box",
{initialIndex:1,api:true});var g={domain:[{key:[{namespace:"/"}]}],type:[{"/type/type/domain":[{key:[{namespace:"/"}]}],"a:/type/type/domain":{id:"/freebase",optional:"forbidden"}}],property:[{"/type/property/schema":{type:"/type/type",domain:[{key:[{namespace:"/"}]}],"a:domain":{id:"/freebase",optional:"forbidden"}}}]},c=a("#domain-search-input"),b=c.closest("form");b.submit(function(){return false});var d={type:"/type/domain",service_url:k.h.legacy_fb_url()};if(a("#domain-search-toggle-commons").is(":checked"))d.mql_filter=
g.domain;c.suggest(d).bind("fb-select",function(e,l){window.location.href=k.h.fb_url(l.id,[["schema"]])}).focus(function(){this.select()});var f=a("#type-search-input"),h=f.closest("form");h.submit(function(){return false});var j={type:"/type/type",service_url:k.h.legacy_fb_url()};if(a("#type-search-toggle-commons").is(":checked"))j.mql_filter=g.type;f.suggest(j).bind("fb-select",function(e,l){window.location.href=k.h.fb_url(l.id,[["schema"]])}).focus(function(){this.select()});var o=a("#property-search-input"),
p=o.closest("form");p.submit(function(){return false});var i={type:"/type/property",service_url:k.h.legacy_fb_url()};if(a("#property-search-toggle-commons").is(":checked"))i.mql_filter=g.property;o.suggest(i).bind("fb-select",function(e,l){window.location.href=k.h.fb_url(l.id,[["schema"]])}).focus(function(){this.select()});a(".search-toggle").click(function(){var e=a(this),l=a(this).parent().siblings("form");e=e.attr("id").split("-");if(l.attr("id")===b.attr("id")){if(e[e.length-1]==="commons")d.mql_filter=
g.domain;else delete d.mql_filter;c.suggest(d)}else if(l.attr("id")===h.attr("id")){if(e[e.length-1]==="commons")j.mql_filter=g.type;else delete j.mql_filter;f.suggest(j)}else if(l.attr("id")===p.attr("id")){if(e[e.length-1]==="commons")i.mql_filter=g.property;else delete i.mql_filter;o.suggest(i)}l=l.find(".text-input");e=l.val();l.val(e).focus().trigger(jQuery.Event("keyup"))})})})(jQuery,window.freebase);
