
/*
 * Copyright 2012, Google Inc.
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
 
 jQuery Tools @VERSION / Expose - Dim the lights

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/toolbox/expose.html

 Since: Mar 2010
 Date: @DATE 
 
 jQuery Tools @VERSION Overlay - Overlay base. Extend it.

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/overlay/

 Since: March 2008
 Date: @DATE 
*/
(function(b){function i(){g();b(this).parents(".headmenu").data("submenu").find("a:first").click();return!1}function f(a,d){var e=b(this),f=e.data("submenu");if(!f.is(".submenu-valid")){var j=e.offset(),h=e.outerHeight(),h=j.top+h;f.is(".center")?(e=e.outerWidth(),j=j.left+e/2-f.outerWidth()/2):f.is(".right")?(e=e.outerWidth(),j=j.left+e-f.outerWidth()):j=j.left;j={display:"none",position:"absolute",top:h,left:j};d.overlay&&(j.zIndex=d.overlay.css("zIndex"));f.css(j);b(document.body).append(f);f.addClass(".submenu-valid")}f.is(":visible")?
g(f):(g(),f.fadeIn());return!1}function g(a){(a||b(".submenu:visible")).fadeOut()}b.factory("nicemenu",{init:function(){var a=this.options;b(".headmenu",this.element).each(function(){var d=b(this),e=d.next(".submenu");d.data("submenu",e);e.data("headmenu",d);b(".default-action",d).click(i);d.click(function(b){return f.apply(this,[b,a])})});b(".submenu",this.element).click(function(){g(b(this));b(this).fadeOut()})}});b(document).click(function(){g()}).bind("scroll resize",function(){g();b(".submenu-valid").each(function(){b(this).removeClass("submenu-valid")})})})(jQuery);
(function(b){function i(){if(b.browser.msie){var a=b(document).height(),d=b(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,20>a-d?d:a]}return[b(document).width(),b(document).height()]}function f(a){if(a)return a.call(b.mask)}b.tools=b.tools||{version:"@VERSION"};var g;g=b.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:!0,closeOnEsc:!0,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var a,d,e,k,j;b.mask={load:function(h,p){if(e)return this;"string"==typeof h&&(h={color:h});h=h||k;k=h=b.extend(b.extend({},g.conf),h);a=b("#"+h.maskId);a.length||(a=b("<div/>").attr("id",h.maskId),b("body").append(a));var n=i();a.css({position:"absolute",top:0,left:0,width:n[0],height:n[1],display:"none",opacity:h.startOpacity,zIndex:h.zIndex});h.color&&a.css("backgroundColor",h.color);if(!1===f(h.onBeforeLoad))return this;h.closeOnEsc&&b(document).bind("keydown.mask",function(a){a.keyCode==
27&&b.mask.close(a)});h.closeOnClick&&a.bind("click.mask",function(a){b.mask.close(a)});b(window).bind("resize.mask",function(){b.mask.fit()});p&&p.length&&(j=p.eq(0).css("zIndex"),b.each(p,function(){var a=b(this);/relative|absolute|fixed/i.test(a.css("position"))||a.css("position","relative")}),d=p.css({zIndex:Math.max(h.zIndex+1,"auto"==j?0:j)}));a.css({display:"block"}).fadeTo(h.loadSpeed,h.opacity,function(){b.mask.fit();f(h.onLoad)});e=!0;return this},close:function(){if(e){if(!1===f(k.onBeforeClose))return this;
a.fadeOut(k.closeSpeed,function(){f(k.onClose);d&&d.css({zIndex:j})});b(document).unbind("keydown.mask");a.unbind("click.mask");b(window).unbind("resize.mask");e=!1}return this},fit:function(){if(e){var b=i();a.css({width:b[0],height:b[1]})}},getMask:function(){return a},isLoaded:function(){return e},getConf:function(){return k},getExposed:function(){return d}};b.fn.mask=function(a){b.mask.load(a);return this};b.fn.expose=function(a){b.mask.load(a,this);return this}})(jQuery);
(function(b){function i(a,d){var e=this,k=a.add(e),j=b(window),h,i,n,m=b.tools.expose&&(d.mask||d.expose),o=Math.random().toString().slice(10);m&&("string"==typeof m&&(m={color:m}),m.closeOnClick=m.closeOnEsc=!1);var l=d.target||a.attr("rel");i=l?b(l):a;if(!i.length)throw"Could not find Overlay: "+l;a&&-1==a.index(i)&&a.click(function(b){e.load(b);return b.preventDefault()});b.extend(e,{load:function(a){if(e.isOpened())return e;var h=g[d.effect];if(!h)throw'Overlay: cannot find effect : "'+d.effect+
'"';d.oneInstance&&b.each(f,function(){this.close(a)});a=a||b.Event();a.type="onBeforeLoad";k.trigger(a);if(a.isDefaultPrevented())return e;n=true;m&&b(i).expose(m);var l=d.top,q=d.left,t=i.outerWidth({margin:true}),r=i.outerHeight({margin:true});typeof l=="string"&&(l=l=="center"?Math.max((j.height()-r)/2,0):parseInt(l,10)/100*j.height());q=="center"&&(q=Math.max((j.width()-t)/2,0));h[0].call(e,{top:l,left:q},function(){if(n){a.type="onLoad";k.trigger(a)}});if(m&&d.closeOnClick)b.mask.getMask().one("click",
e.close);d.closeOnClick&&b(document).bind("click."+o,function(c){b(c.target).parents(i).length||e.close(c)});d.closeOnEsc&&b(document).bind("keydown."+o,function(c){c.keyCode==27&&e.close(c)});return e},close:function(a){if(!e.isOpened())return e;a=a||b.Event();a.type="onBeforeClose";k.trigger(a);if(!a.isDefaultPrevented()){n=false;g[d.effect][1].call(e,function(){a.type="onClose";k.trigger(a)});b(document).unbind("click."+o).unbind("keydown."+o);m&&b.mask.close();return e}},getOverlay:function(){return i},
getTrigger:function(){return a},getClosers:function(){return h},isOpened:function(){return n},getConf:function(){return d}});b.each(["onBeforeLoad","onStart","onLoad","onBeforeClose","onClose"],function(a,f){b.isFunction(d[f])&&b(e).bind(f,d[f]);e[f]=function(a){b(e).bind(f,a);return e}});h=i.find(d.close||".close");!h.length&&!d.close&&(h=b('<a class="close"></a>'),i.prepend(h));h.click(function(b){e.close(b)});d.load&&e.load()}b.tools=b.tools||{version:"@VERSION"};b.tools.overlay={addEffect:function(b,
d,f){g[b]=[d,f]},conf:{close:null,closeOnClick:!0,closeOnEsc:!0,closeSpeed:"fast",effect:"default",fixed:!b.browser.msie||6<b.browser.version,left:"center",load:!1,mask:null,oneInstance:!0,speed:"normal",target:null,top:"10%"}};var f=[],g={};b.tools.overlay.addEffect("default",function(a,f){var e=this.getConf(),g=b(window);e.fixed||(a.top+=g.scrollTop(),a.left+=g.scrollLeft());a.position=e.fixed?"fixed":"absolute";this.getOverlay().css(a).fadeIn(e.speed,f)},function(b){this.getOverlay().fadeOut(this.getConf().closeSpeed,
b)});b.fn.overlay=function(a){var d=this.data("overlay");if(d)return d;b.isFunction(a)&&(a={onBeforeLoad:a});a=b.extend(!0,{},b.tools.overlay.conf,a);this.each(function(){d=new i(b(this),a);f.push(d);b(this).data("overlay",d)});return a.api?d:this}})(jQuery);
(function(b){var i="undefined"!=typeof window.innerWidth?function(){return{w:window.innerWidth,h:window.innerHeight}}:"undefined"!=typeof document.documentElement&&"undefined"!=typeof document.documentElement.clientWidth&&0!=document.documentElement.clientWidth?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}};window.kbs=
function(f){b(".kbs.current",f).removeClass("current");var g=b(".domain-section:first",f),a=b(".domain-section:last",f),d=this.scroll_to=function(c){var a=b(document).scrollTop();b(document).height();var f=i().h,f=a+f,d=c.offset().top,c=d+c.height();d<a?b(document).scrollTop(d):c>f&&b(document).scrollTop(a+(c-f))},e=this.get_current=function(){return b(".kbs.current:first",f)},k=this.set_next=function(c,b,a){c=c||e();b.length&&(c.removeClass("current"),b.addClass("current"),a||d(b))},j=this.next_domain=
function(c){var b=e(),a=h(b);a&&(a=a.find(".kbs:first"),k(b,a,c))},h=this._next_domain=function(c){if(!c||!c.length)return b(".domain-section:first",f);c=c.closest(".domain-section");return!c.length||c[0]===a[0]?g:c.next(".domain-section")},p=this.prev_domain=function(){var c=e(),b=n(c);b&&(b=b.find(".kbs:first"),k(c,b))},n=this._prev_domain=function(c){if(!c||!c.length)return b(".domain-section:last",f);var d=c.closest(".domain-section");return c.closest(".property-section").length||c.closest(".type-section").length?
d:!d.length||d[0]===g[0]?a:d.prev(".domain-section")},m=this.next_type=function(){var c=e(),b=o(c);b&&(b=b.find(".kbs:first"),k(c,b))},o=this._next_type=function(c){if(!c||!c.length)return b(".type-section:first",f);var a=c.closest(".domain-section"),c=c.closest(".type-section"),c=c.length?c.next(".type-section"):a.find(".type-section:first");if(!c||!c.length){var d=h(a);if(d)for(;d.get(0)!==a.get(0);){c=d.find(".type-section:first");if(c.length)break;d=h(d)}}return c},l=this.prev_type=function(){var b=
e(),a=s(b);a&&(a=a.find(".kbs:first"),k(b,a))},s=this._prev_type=function(c){if(!c||!c.length)return b(".type-section:last",f);var a=c.closest(".domain-section"),d=c.closest(".type-section");if(c.closest(".property-section").length)return d;var e;d.length&&(e=d.prev(".type-section"));if(!e||!e.length)if(c=n(a))for(;c.get(0)!==a.get(0);){e=c.find(".type-section:last");if(e.length)break;c=n(c)}return e},u=this.next_prop=function(){var b=e(),a=v(b);a&&(a=a.find(".kbs:first"),k(b,a))},v=this._next_prop=
function(c){if(!c||!c.length)return b(".property-section:first",f);var a=c.closest(".domain-section"),d=c.closest(".type-section"),e=c.closest(".property-section"),a=e.length?e.next(".property-section"):d.length?d.find(".property-section:first"):a.find(".property-section:first");if(!a||!a.length)if(c=o(c))for(;c.get(0)!==d.get(0);){a=c.find(".property-section:first");if(a.length)break;null==d.get(0)&&(d=c);c=o(c)}return a},q=this.prev_prop=function(){var b=e(),a=t(b);a&&(a=a.find(".kbs:first"),k(b,
a))},t=this._prev_prop=function(a){if(!a||!a.length)return b(".property-section:last",f);var d=a.closest(".domain-section"),e=a.closest(".type-section"),g=a.closest(".property-section");if(a.closest(".data-section").length)return g;var h;g.length&&(h=g.prev(".property-section"));if(!h||!h.length)if(l=e.length?s(e):s(d))for(;l.get(0)!==e.get(0);){h=l.find(".property-section:last");if(h.length)break;null==e.get(0)&&(e=l);l=s(l)}return h};this.next=function(){var b=e(),a=this._next(b);a&&k(b,a)};this._next=
function(c){if(!c||!c.length)return b(".domain-section:first .kbs:first",f);var d=c.closest(".domain-section"),e=c.closest(".type-section"),h=c.closest(".property-section");if(c.closest(".data-section").length){c=c.next(".kbs");if(c.length)return c;c=h.next(".property-section").find(".kbs:first");if(c.length)return c;c=e.next(".type-section").find(".kbs:first")}else if(h.length){c=h.find(".data-section:first .kbs:first");if(c.length)return c;c=h.next(".property-section").find(".kbs:first");if(c.length)return c;
c=e.next(".type-section").find(".kbs:first")}else if(e.length){c=e.find(".property-section:first .kbs:first");if(c.length)return c;c=e.next(".type-section").find(".kbs:first")}else c=d.find(".type-section:first .kbs:first");return c.length?c:d.get(0)===a.get(0)?g.find(".kbs:first"):d.next(".domain-section").find(".kbs:first")};this.prev=function(){var b=e(),a=this._prev(b);a&&k(b,a)};this._prev=function(c){if(!c||!c.length)return c=b(".data-section:last .kbs:last",f),c.length||(c=b(".property-section:last .kbs:first",
f)),c.length||(c=b(".type-section:last .kbs:first",f)),c.length||(c=b(".domain-section:last .kbs:first",f)),c;var d=c.closest(".domain-section"),e=c.closest(".type-section"),h=c.closest(".property-section");return c.closest(".data-section").length?(c=c.prev(".kbs"),c.length?c:h.find(".kbs:first")):h.length?(c=h.prev(".property-section").find(".kbs:last"),c.length?c:e.find(".kbs:first")):e.length?(c=e.prev(".type-section").find(".kbs:last"),c.length?c:d.find(".kbs:first")):d.get(0)===g.get(0)?a.find(".kbs:last"):
d.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var r=this;b(document).unbind(".kbs").bind("keydown.kbs",function(a){var d=a.target;if(d==document.body||d==document||d==window||d==b("html")[0])d=a.keyCode,68===d?a.shiftKey?p():j():84===d?a.shiftKey?l():m():80===d?a.shiftKey?q():u():74===d?r.next():75===d?r.prev():69===d&&r.edit()})}})(jQuery);
(function(b,i){var f=window.propbox={init:function(g,a){a=b.extend({lang:"/lang/en"},a);if(!a.base_ajax_url)throw Error("base_ajax_url required in propbox options");if(!a.base_static_url)throw Error("base_static_url required in propbox options");if(!a.id)throw Error("topic id required in propbox options");if(!a.lang)throw Error("lang required in propbox options");f.options=a;f.kbs=new i(g);f.kbs.set_next(f.kbs.get_current(),b(".kbs:visible:first",g,!0));b(".kbs",g).live("click",function(){var a=f.kbs.get_current();
f.kbs.set_next(a,b(this),!0)}).live("edit",function(){var a=b(this).find(".headmenu:first").data("submenu");a&&b("li:first a:first",a).click()});f.init_menus(g)},init_menus:function(g,a){g=b(g||document);a&&b(".nicemenu",g).nicemenu();(g&&g.is(".data-row")?g:b(".data-row",g)).hover(f.row_menu_hoverover,f.row_menu_hoverout);b(".nicemenu .headmenu",g).add(b(".nicemenu .default-action",g)).click("click",function(){if(f.kbs){var a=f.kbs.get_current();a&&f.kbs.set_next(a,b(this).parents(".kbs:first"),
!0)}return!1})},row_menu_hoverover:function(){var g=b(this);f.row_menu_hoverover.timeout=setTimeout(function(){g.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(f.row_menu_hoverover.timeout);b(this).removeClass("row-hover")},get_script:function(g,a){var d=f.get_script.cache;d||(d=f.get_script.cache={});var e=d[g];e?1===e.state?e.callbacks.push(a):4===e.state&&a():(e=d[g]={state:0,callbacks:[a]},b.ajax({url:f.options.base_static_url+g,dataType:"script",beforeSend:function(){e.state=
1},success:function(){e.state=4;b.each(e.callbacks,function(a,b){b()})},error:function(){e.state=-1}}))},prop_edit:function(g,a){var d=b(g).parents(".submenu").data("headmenu").parents(".property-section").find(".data-section .data-row:first:visible .nicemenu:first .headmenu:first a");d.length?d.click():f.prop_add(g,a);return!1},prop_add:function(g,a){var d=b(g).parents(".submenu").data("headmenu").parents(".property-section");f.get_script("/propbox-edit.mf.js",function(){f.edit.prop_add_begin(d,
a)});return!1},value_edit:function(g){var a=b(g).parents(".submenu").data("headmenu").parents(".data-row:first"),d=a.parents(".property-section");f.get_script("/propbox-edit.mf.js",function(){f.edit.value_edit_begin(d,a)});return!1},value_delete:function(g){var a=b(g).parents(".submenu").data("headmenu").parents(".data-row:first"),d=a.parents(".property-section");f.get_script("/propbox-edit.mf.js",function(){f.edit.value_delete_begin(d,a)});return!1},close_message:function(f){b(f).parents(".row-msg:first").remove();
return!1}}})(jQuery,window.kbs);(function(b,i,f){var g=i.formbuilder={init:function(){i.c.header&&b("#header").fadeIn();b(".nicemenu").nicemenu();f.init(null,{id:i.c.id,base_ajax_url:i.h.ajax_url("lib/propbox"),base_static_url:i.h.static_url("lib/propbox"),lang:i.lang||"/lang/en",suggest_impl:i.suggest_options,incompatible_types:i.incompatible_types});b(window).bind("fb.user.signedin",function(a,d){b("#signedin > a:first").text(d.name)})}};b(g.init)})(jQuery,window.freebase,window.propbox);
