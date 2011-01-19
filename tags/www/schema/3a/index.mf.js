
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
(function(a){a.fn.showRow=function(m,n,h){n=n==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var c=a(this).hide(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();c.show();d[n](h,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});m&&m.call(b)})})};a.fn.hideRow=function(m,n,h){n=n==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var c=a(this).show(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[n](h,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c.hide();m&&m.call(b)})})}})(jQuery);
(function(a){function m(b,c,d){var f=this,g=b.add(this),i=b.find(d.tabs),o=c.jquery?c:b.children(c),p;i.length||(i=b.children());o.length||(o=b.parent().find(c));o.length||(o=a(c));a.extend(this,{click:function(j,e){var k=i.eq(j);if(typeof j=="string"&&j.replace("#","")){k=i.filter("[href*="+j.replace("#","")+"]");j=Math.max(i.index(k),0)}if(d.rotate){var s=i.length-1;if(j<0)return f.click(s,e);if(j>s)return f.click(0,e)}if(!k.length){if(p>=0)return f;j=d.initialIndex;k=i.eq(j)}if(j===p)return f;
e=e||a.Event();e.type="onBeforeClick";g.trigger(e,[j]);if(!e.isDefaultPrevented()){n[d.effect].call(f,j,function(){e.type="onClick";g.trigger(e,[j])});p=j;i.removeClass(d.current);k.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return i},getPanes:function(){return o},getCurrentPane:function(){return o.eq(p)},getCurrentTab:function(){return i.eq(p)},getIndex:function(){return p},next:function(){return f.click(p+1)},prev:function(){return f.click(p-1)},destroy:function(){i.unbind(d.event).removeClass(d.current);
o.find("a[href^=#]").unbind("click.T");return f}});a.each("onBeforeClick,onClick".split(","),function(j,e){a.isFunction(d[e])&&a(f).bind(e,d[e]);f[e]=function(k){a(f).bind(e,k);return f}});if(d.history&&a.fn.history){a.tools.history.init(i);d.event="history"}i.each(function(j){a(this).bind(d.event,function(e){f.click(j,e);return e.preventDefault()})});o.find("a[href^=#]").bind("click.T",function(j){f.click(a(this).attr("href"),j)});if(location.hash)f.click(location.hash);else if(d.initialIndex===
0||d.initialIndex>0)f.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,c){n[b]=c}};var n={"default":function(b,c){this.getPanes().hide().eq(b).show();c.call()},fade:function(b,c){var d=this.getConf(),f=d.fadeOutSpeed,g=this.getPanes();f?g.fadeOut(f):g.hide();g.eq(b).fadeIn(d.fadeInSpeed,c)},slide:function(b,c){this.getPanes().slideUp(200);
this.getPanes().eq(b).slideDown(400,c)},ajax:function(b,c){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),c)}},h;a.tools.tabs.addEffect("horizontal",function(b,c){h||(h=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(b).animate({width:h},function(){a(this).show();c.call()})});a.fn.tabs=function(b,c){var d=this.data("tabs");if(d){d.destroy();this.removeData("tabs")}if(a.isFunction(c))c={onBeforeClick:c};c=a.extend({},
a.tools.tabs.conf,c);this.each(function(){d=new m(a(this),b,c);a(this).data("tabs",d)});return c.api?d:this}})(jQuery);
(function(a){function m(b,c,d){var f=d.relative?b.position().top:b.offset().top,g=d.relative?b.position().left:b.offset().left,i=d.position[0];f-=c.outerHeight()-d.offset[0];g+=b.outerWidth()+d.offset[1];var o=c.outerHeight()+b.outerHeight();if(i=="center")f+=o/2;if(i=="bottom")f+=o;i=d.position[1];b=c.outerWidth()+b.outerWidth();if(i=="center")g-=b/2;if(i=="left")g-=b;return{top:f,left:g}}function n(b,c){var d=this,f=b.add(d),g,i=0,o=0,p=b.attr("title"),j=h[c.effect],e,k=b.is(":input"),s=k&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=c.events[u]||c.events[k?s?"widget":"input":"def"];if(!j)throw'Nonexistent effect "'+c.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(l){clearTimeout(i);if(c.predelay)o=setTimeout(function(){d.show(l)},c.predelay);else d.show(l)}).bind(r[1],function(l){clearTimeout(o);if(c.delay)i=setTimeout(function(){d.hide(l)},c.delay);else d.hide(l)});if(p&&c.cancelDefault){b.removeAttr("title");b.data("title",p)}a.extend(d,{show:function(l){if(!g){if(p)g=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(p);else if(c.tip)g=a(c.tip).eq(0);else{g=b.next();g.length||(g=b.parent().next())}if(!g.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;g.stop(true,true);var q=m(b,g,c);l=l||a.Event();l.type="onBeforeShow";f.trigger(l,[q]);if(l.isDefaultPrevented())return d;q=m(b,g,c);g.css({position:"absolute",top:q.top,left:q.left});e=true;j[0].call(d,function(){l.type="onShow";e="full";f.trigger(l)});q=c.events.tooltip.split(/,\s*/);
g.bind(q[0],function(){clearTimeout(i);clearTimeout(o)});q[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&g.bind(q[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(l){if(!g||!d.isShown())return d;l=l||a.Event();l.type="onBeforeHide";f.trigger(l);if(!l.isDefaultPrevented()){e=false;h[c.effect][1].call(d,function(){l.type="onHide";e=false;f.trigger(l)});return d}},isShown:function(l){return l?e=="full":e},getConf:function(){return c},getTip:function(){return g},
getTrigger:function(){return b}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(l,q){a.isFunction(c[q])&&a(d).bind(q,c[q]);d[q]=function(t){a(d).bind(q,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,c,d){h[b]=[c,d]}};var h={toggle:[function(b){var c=this.getConf(),d=this.getTip();c=c.opacity;c<1&&d.css({opacity:c});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(true,{},a.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){c=new n(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,m){var n=m.schema={init_row_menu:function(h){a(".row-menu-trigger",h).each(function(){var b=a(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(n.row_menu_hoverover,n.row_menu_hoverout)})},row_menu_hoverover:function(){var h=a(this);h.addClass("row-hover");a(".row-menu-trigger",h).css("visibility","visible")},row_menu_hoverout:function(){var h=a(this);a(".row-menu-trigger",h).css("visibility","hidden");
h.removeClass("row-hover")},close_message:function(h,b){var c=a(this).parents(b);c.is("tr")?c.hideRow(function(){c.remove()}):c.slideUp(function(){c.remove()});return false},init_modal_help:function(h){a(".modal-help-toggle",h).click(function(){var b=a(this),c=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(c.is(":hidden")){c.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{c.slideUp();b.html("[ + ] Show Help")}})}};a(function(){a.tablesorter.addParser({id:"schemaName",
is:function(){return false},format:function(d){return a(d).text().toLowerCase()},type:"text"});a.tablesorter.addParser({id:"commaDigit",is:function(){return false},format:function(d){return parseInt(d.replace(/\,/g,""))},type:"numeric"});a.tablesorter.defaults.cssAsc="column-header-asc";a.tablesorter.defaults.cssDesc="column-header-desc";a.tablesorter.defaults.cssHeader="column-header";n.init_row_menu();a(".blurb-trigger").click(function(){var d=a(this),f=d.siblings(".blurb"),g=d.siblings(".blob");
if(g.is(":hidden")){g.show();f.hide();d.text("Less")}else{g.hide();f.show();d.text("More")}});var h=a(".breadcrumb-sibling-trigger").outerWidth();a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-h],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}});h=a("#language-select").change(function(){var d=a(this).val();a.cookie("lang",d,{path:"/"});window.location.reload(true)});
var b,c;a("option",h).each(function(){var d=a(this);if(d.val()==="/lang/en")b=d;if(d.val()===m.acre.lang.mql){c=d.attr("selected","selected");return false}});!c&&b&&b.attr("selected","selected")})})(jQuery,window.freebase);
(function(a,m){m.user?a("#create-new-domain").show():a(window).bind("fb.user.signedin",function(){a("#create-new-domain").show()});m.schema.index={add_domain:function(){var n=a(this);m.get_script(m.acre.request.app_url+"/schema/index-edit.mf.js",function(){m.schema.index.edit.add_domain_begin(n)});return false}};a(function(){var n=a(".table-sortable").tablesorter();a("thead th:nth-child(2)",n)[0].count=1;a("thead th:nth-child(3)",n)[0].count=1;a("thead th:nth-child(4)",n)[0].count=1;a("#schema-search > .section-tabset").tabs("#schema-search > .search-box",
{initialIndex:1,api:true});var h={domain:[{key:[{namespace:"/"}]}],type:[{"/type/type/domain":[{key:[{namespace:"/"}]}],"a:/type/type/domain":{id:"/freebase",optional:"forbidden"}}],property:[{"/type/property/schema":{type:"/type/type",domain:[{key:[{namespace:"/"}]}],"a:domain":{id:"/freebase",optional:"forbidden"}}}]},b=a("#domain-search-input"),c=b.closest("form");c.submit(function(){return false});var d={type:"/type/domain"};if(a("#domain-search-toggle-commons").is(":checked"))d.mql_filter=h.domain;
b.suggest(d).bind("fb-select",function(e,k){window.location.href=m.acre.request.app_url+"/schema"+k.id}).focus(function(){this.select()});var f=a("#type-search-input"),g=f.closest("form");g.submit(function(){return false});var i={type:"/type/type"};if(a("#type-search-toggle-commons").is(":checked"))i.mql_filter=h.type;f.suggest(i).bind("fb-select",function(e,k){window.location.href=m.acre.request.app_url+"/schema"+k.id}).focus(function(){this.select()});var o=a("#property-search-input"),p=o.closest("form");
p.submit(function(){return false});var j={type:"/type/property"};if(a("#property-search-toggle-commons").is(":checked"))j.mql_filter=h.property;o.suggest(j).bind("fb-select",function(e,k){window.location.href=m.acre.request.app_url+"/schema"+k.id}).focus(function(){this.select()});a(".search-toggle").click(function(){var e=a(this),k=a(this).parent().siblings("form");e=e.attr("id").split("-");if(k.attr("id")===c.attr("id")){if(e[e.length-1]==="commons")d.mql_filter=h.domain;else delete d.mql_filter;
b.suggest(d)}else if(k.attr("id")===g.attr("id")){if(e[e.length-1]==="commons")i.mql_filter=h.type;else delete i.mql_filter;f.suggest(i)}else if(k.attr("id")===p.attr("id")){if(e[e.length-1]==="commons")j.mql_filter=h.property;else delete j.mql_filter;o.suggest(j)}k=k.find(".text-input");e=k.val();k.val(e).focus().trigger(jQuery.Event("keyup"))})})})(jQuery,window.freebase);
