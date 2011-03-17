
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
(function(a){a.fn.showRow=function(k,n,g){n=n==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var c=a(this).hide(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();c.show();d[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});k&&k.call(b)})})};a.fn.hideRow=function(k,n,g){n=n==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var c=a(this).show(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c.hide();k&&k.call(b)})})}})(jQuery);
(function(a){function k(b,c,d){var f=this,h=b.add(this),j=b.find(d.tabs),o=c.jquery?c:b.children(c),p;j.length||(j=b.children());o.length||(o=b.parent().find(c));o.length||(o=a(c));a.extend(this,{click:function(i,e){var l=j.eq(i);if(typeof i=="string"&&i.replace("#","")){i=i.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");l=j.filter("[href*="+i.replace("#","")+"]");i=Math.max(j.index(l),0)}if(d.rotate){var s=j.length-1;if(i<0)return f.click(s,e);if(i>s)return f.click(0,
e)}if(!l.length){if(p>=0)return f;i=d.initialIndex;l=j.eq(i)}if(i===p)return f;e=e||a.Event();e.type="onBeforeClick";h.trigger(e,[i]);if(!e.isDefaultPrevented()){n[d.effect].call(f,i,function(){e.type="onClick";h.trigger(e,[i])});p=i;j.removeClass(d.current);l.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return j},getPanes:function(){return o},getCurrentPane:function(){return o.eq(p)},getCurrentTab:function(){return j.eq(p)},getIndex:function(){return p},next:function(){return f.click(p+
1)},prev:function(){return f.click(p-1)},destroy:function(){j.unbind(d.event).removeClass(d.current);o.find("a[href^=#]").unbind("click.T");return f}});a.each("onBeforeClick,onClick".split(","),function(i,e){a.isFunction(d[e])&&a(f).bind(e,d[e]);f[e]=function(l){a(f).bind(e,l);return f}});if(d.history&&a.fn.history){a.tools.history.init(j);d.event="history"}j.each(function(i){a(this).bind(d.event,function(e){f.click(i,e);return e.preventDefault()})});o.find("a[href^=#]").bind("click.T",function(i){f.click(a(this).attr("href"),
i)});if(location.hash)f.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)f.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,c){n[b]=c}};var n={"default":function(b,c){this.getPanes().hide().eq(b).show();c.call()},fade:function(b,c){var d=this.getConf(),f=d.fadeOutSpeed,h=this.getPanes();f?h.fadeOut(f):
h.hide();h.eq(b).fadeIn(d.fadeInSpeed,c)},slide:function(b,c){this.getPanes().slideUp(200);this.getPanes().eq(b).slideDown(400,c)},ajax:function(b,c){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),c)}},g;a.tools.tabs.addEffect("horizontal",function(b,c){g||(g=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(b).animate({width:g},function(){a(this).show();c.call()})});a.fn.tabs=function(b,c){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(a.isFunction(c))c={onBeforeClick:c};c=a.extend({},a.tools.tabs.conf,c);this.each(function(){d=new k(a(this),b,c);a(this).data("tabs",d)});return c.api?d:this}})(jQuery);
(function(a){function k(b,c,d){var f=d.relative?b.position().top:b.offset().top,h=d.relative?b.position().left:b.offset().left,j=d.position[0];f-=c.outerHeight()-d.offset[0];h+=b.outerWidth()+d.offset[1];var o=c.outerHeight()+b.outerHeight();if(j=="center")f+=o/2;if(j=="bottom")f+=o;j=d.position[1];b=c.outerWidth()+b.outerWidth();if(j=="center")h-=b/2;if(j=="left")h-=b;return{top:f,left:h}}function n(b,c){var d=this,f=b.add(d),h,j=0,o=0,p=b.attr("title"),i=g[c.effect],e,l=b.is(":input"),s=l&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=c.events[u]||c.events[l?s?"widget":"input":"def"];if(!i)throw'Nonexistent effect "'+c.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(m){clearTimeout(j);if(c.predelay)o=setTimeout(function(){d.show(m)},c.predelay);else d.show(m)}).bind(r[1],function(m){clearTimeout(o);if(c.delay)j=setTimeout(function(){d.hide(m)},c.delay);else d.hide(m)});if(p&&c.cancelDefault){b.removeAttr("title");b.data("title",p)}a.extend(d,{show:function(m){if(!h){if(p)h=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(p);else if(c.tip)h=a(c.tip).eq(0);else{h=b.next();h.length||(h=b.parent().next())}if(!h.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;h.stop(true,true);var q=k(b,h,c);m=m||a.Event();m.type="onBeforeShow";f.trigger(m,[q]);if(m.isDefaultPrevented())return d;q=k(b,h,c);h.css({position:"absolute",top:q.top,left:q.left});e=true;i[0].call(d,function(){m.type="onShow";e="full";f.trigger(m)});q=c.events.tooltip.split(/,\s*/);
h.bind(q[0],function(){clearTimeout(j);clearTimeout(o)});q[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&h.bind(q[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(m){if(!h||!d.isShown())return d;m=m||a.Event();m.type="onBeforeHide";f.trigger(m);if(!m.isDefaultPrevented()){e=false;g[c.effect][1].call(d,function(){m.type="onHide";e=false;f.trigger(m)});return d}},isShown:function(m){return m?e=="full":e},getConf:function(){return c},getTip:function(){return h},
getTrigger:function(){return b}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(m,q){a.isFunction(c[q])&&a(d).bind(q,c[q]);d[q]=function(t){a(d).bind(q,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,c,d){g[b]=[c,d]}};var g={toggle:[function(b){var c=this.getConf(),d=this.getTip();c=c.opacity;c<1&&d.css({opacity:c});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(true,{},a.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){c=new n(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,k){var n=k.schema={init_row_menu:function(g){a(".row-menu-trigger",g).each(function(){var b=a(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(n.row_menu_hoverover,n.row_menu_hoverout)})},row_menu_hoverover:function(){var g=a(this);g.addClass("row-hover");a(".row-menu-trigger",g).css("visibility","visible")},row_menu_hoverout:function(){var g=a(this);a(".row-menu-trigger",g).css("visibility","hidden");
g.removeClass("row-hover")},close_message:function(g,b){var c=a(this).parents(b);c.is("tr")?c.hideRow(function(){c.remove()}):c.slideUp(function(){c.remove()});return false},init_modal_help:function(g){a(".modal-help-toggle",g).click(function(){var b=a(this),c=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(c.is(":hidden")){c.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{c.slideUp();b.html("[ + ] Show Help")}})}};a(function(){a.tablesorter.addParser({id:"schemaName",
is:function(){return false},format:function(d){return a(d).text().toLowerCase()},type:"text"});a.tablesorter.addParser({id:"commaDigit",is:function(){return false},format:function(d){return parseInt(d.replace(/\,/g,""),10)},type:"numeric"});a.tablesorter.defaults.cssAsc="column-header-asc";a.tablesorter.defaults.cssDesc="column-header-desc";a.tablesorter.defaults.cssHeader="column-header";n.init_row_menu();var g=a(".breadcrumb-sibling-trigger").outerWidth();a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},
position:"bottom right",offset:[-5,-g],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}});g=a("#language-select").change(function(){var d=a(this).val();a.cookie("lang",d,{path:"/"});window.location.reload(true)});var b,c;a("option",g).each(function(){var d=a(this);if(d.val()==="/lang/en")b=d;if(d.val()===k.acre.lang.primary){c=d.attr("selected","selected");return false}});!c&&b&&b.attr("selected","selected")})})(jQuery,
window.freebase);
(function(a,k){k.user?a("#create-new-domain").show():a(window).bind("fb.user.signedin",function(){a("#create-new-domain").show()});k.schema.index={add_domain:function(){var n=a(this);k.get_script(k.acre.request.app_url+"/schema/index-edit.mf.js",function(){k.schema.index.edit.add_domain_begin(n)});return false}};a(function(){var n=a(".table-sortable").tablesorter();a("thead th:nth-child(2)",n)[0].count=1;a("thead th:nth-child(3)",n)[0].count=1;a("thead th:nth-child(4)",n)[0].count=1;a("#schema-search > .section-tabset").tabs("#schema-search > .search-box",
{initialIndex:1,api:true});var g={domain:[{key:[{namespace:"/"}]}],type:[{"/type/type/domain":[{key:[{namespace:"/"}]}],"a:/type/type/domain":{id:"/freebase",optional:"forbidden"}}],property:[{"/type/property/schema":{type:"/type/type",domain:[{key:[{namespace:"/"}]}],"a:domain":{id:"/freebase",optional:"forbidden"}}}]},b=a("#domain-search-input"),c=b.closest("form");c.submit(function(){return false});var d={type:"/type/domain",service_url:k.h.legacy_fb_url()};if(a("#domain-search-toggle-commons").is(":checked"))d.mql_filter=
g.domain;b.suggest(d).bind("fb-select",function(e,l){window.location.href=k.acre.request.app_url+"/schema"+l.id}).focus(function(){this.select()});var f=a("#type-search-input"),h=f.closest("form");h.submit(function(){return false});var j={type:"/type/type",service_url:k.h.legacy_fb_url()};if(a("#type-search-toggle-commons").is(":checked"))j.mql_filter=g.type;f.suggest(j).bind("fb-select",function(e,l){window.location.href=k.acre.request.app_url+"/schema"+l.id}).focus(function(){this.select()});var o=
a("#property-search-input"),p=o.closest("form");p.submit(function(){return false});var i={type:"/type/property",service_url:k.h.legacy_fb_url()};if(a("#property-search-toggle-commons").is(":checked"))i.mql_filter=g.property;o.suggest(i).bind("fb-select",function(e,l){window.location.href=k.acre.request.app_url+"/schema"+l.id}).focus(function(){this.select()});a(".search-toggle").click(function(){var e=a(this),l=a(this).parent().siblings("form");e=e.attr("id").split("-");if(l.attr("id")===c.attr("id")){if(e[e.length-
1]==="commons")d.mql_filter=g.domain;else delete d.mql_filter;b.suggest(d)}else if(l.attr("id")===h.attr("id")){if(e[e.length-1]==="commons")j.mql_filter=g.type;else delete j.mql_filter;f.suggest(j)}else if(l.attr("id")===p.attr("id")){if(e[e.length-1]==="commons")i.mql_filter=g.property;else delete i.mql_filter;o.suggest(i)}l=l.find(".text-input");e=l.val();l.val(e).focus().trigger(jQuery.Event("keyup"))})})})(jQuery,window.freebase);
