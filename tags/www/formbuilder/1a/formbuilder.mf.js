
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
(function(b){function q(){h();b(this).parents(".headmenu").data("submenu").find("a:first").click();return false}function i(e,f){var k=b(this),m=k.data("submenu");if(!m.is(".submenu-valid")){var g=k.offset(),o=k.outerHeight();o=g.top+o;if(m.is(".center")){k=k.outerWidth();g=g.left+k/2-m.outerWidth()/2}else if(m.is(".right")){k=k.outerWidth();g=g.left+k-m.outerWidth()}else g=g.left;g={display:"none",position:"absolute",top:o,left:g};if(f.overlay)g.zIndex=f.overlay.css("zIndex");m.css(g);b(document.body).append(m);
m.addClass(".submenu-valid")}if(m.is(":visible"))h(m);else{h();m.fadeIn()}return false}function h(e){(e||b(".submenu:visible")).fadeOut()}function d(e){(e||b(".submenu-valid")).each(function(){b(this).removeClass("submenu-valid")})}b.factory("nicemenu",{init:function(){var e=this.options;b(".headmenu",this.element).each(function(){var f=b(this),k=f.next(".submenu");f.data("submenu",k);k.data("headmenu",f);b(".default-action",f).click(q);f.click(function(m){return i.apply(this,[m,e])})});b(".submenu",
this.element).click(function(){h(b(this));b(this).fadeOut()})}});b(document).click(function(){h()}).bind("scroll resize",function(){h();d()})})(jQuery);
(function(b){function q(){if(b.browser.msie){var g=b(document).height(),o=b(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,g-o<20?o:g]}return[b(document).width(),b(document).height()]}function i(g){if(g)return g.call(b.mask)}b.tools=b.tools||{version:"@VERSION"};var h;h=b.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:true,closeOnEsc:true,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var d,e,f,k,m;b.mask={load:function(g,o){if(f)return this;if(typeof g=="string")g={color:g};g=g||k;k=g=b.extend(b.extend({},h.conf),g);d=b("#"+g.maskId);if(!d.length){d=b("<div/>").attr("id",g.maskId);b("body").append(d)}var r=q();d.css({position:"absolute",top:0,left:0,width:r[0],height:r[1],display:"none",opacity:g.startOpacity,zIndex:g.zIndex});g.color&&d.css("backgroundColor",g.color);if(i(g.onBeforeLoad)===false)return this;g.closeOnEsc&&b(document).bind("keydown.mask",function(p){p.keyCode==
27&&b.mask.close(p)});g.closeOnClick&&d.bind("click.mask",function(p){b.mask.close(p)});b(window).bind("resize.mask",function(){b.mask.fit()});if(o&&o.length){m=o.eq(0).css("zIndex");b.each(o,function(){var p=b(this);/relative|absolute|fixed/i.test(p.css("position"))||p.css("position","relative")});e=o.css({zIndex:Math.max(g.zIndex+1,m=="auto"?0:m)})}d.css({display:"block"}).fadeTo(g.loadSpeed,g.opacity,function(){b.mask.fit();i(g.onLoad)});f=true;return this},close:function(){if(f){if(i(k.onBeforeClose)===
false)return this;d.fadeOut(k.closeSpeed,function(){i(k.onClose);e&&e.css({zIndex:m})});b(document).unbind("keydown.mask");d.unbind("click.mask");b(window).unbind("resize.mask");f=false}return this},fit:function(){if(f){var g=q();d.css({width:g[0],height:g[1]})}},getMask:function(){return d},isLoaded:function(){return f},getConf:function(){return k},getExposed:function(){return e}};b.fn.mask=function(g){b.mask.load(g);return this};b.fn.expose=function(g){b.mask.load(g,this);return this}})(jQuery);
(function(b){function q(d,e){var f=this,k=d.add(f),m=b(window),g,o,r,p=b.tools.expose&&(e.mask||e.expose),v=Math.random().toString().slice(10);if(p){if(typeof p=="string")p={color:p};p.closeOnClick=p.closeOnEsc=false}var s=e.target||d.attr("rel");o=s?b(s):d;if(!o.length)throw"Could not find Overlay: "+s;d&&d.index(o)==-1&&d.click(function(l){f.load(l);return l.preventDefault()});b.extend(f,{load:function(l){if(f.isOpened())return f;var t=h[e.effect];if(!t)throw'Overlay: cannot find effect : "'+e.effect+
'"';e.oneInstance&&b.each(i,function(){this.close(l)});l=l||b.Event();l.type="onBeforeLoad";k.trigger(l);if(l.isDefaultPrevented())return f;r=true;p&&b(o).expose(p);var u=e.top,x=e.left,z=o.outerWidth({margin:true}),y=o.outerHeight({margin:true});if(typeof u=="string")u=u=="center"?Math.max((m.height()-y)/2,0):parseInt(u,10)/100*m.height();if(x=="center")x=Math.max((m.width()-z)/2,0);t[0].call(f,{top:u,left:x},function(){if(r){l.type="onLoad";k.trigger(l)}});p&&e.closeOnClick&&b.mask.getMask().one("click",
f.close);e.closeOnClick&&b(document).bind("click."+v,function(a){b(a.target).parents(o).length||f.close(a)});e.closeOnEsc&&b(document).bind("keydown."+v,function(a){a.keyCode==27&&f.close(a)});return f},close:function(l){if(!f.isOpened())return f;l=l||b.Event();l.type="onBeforeClose";k.trigger(l);if(!l.isDefaultPrevented()){r=false;h[e.effect][1].call(f,function(){l.type="onClose";k.trigger(l)});b(document).unbind("click."+v).unbind("keydown."+v);p&&b.mask.close();return f}},getOverlay:function(){return o},
getTrigger:function(){return d},getClosers:function(){return g},isOpened:function(){return r},getConf:function(){return e}});b.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(l,t){b.isFunction(e[t])&&b(f).bind(t,e[t]);f[t]=function(u){b(f).bind(t,u);return f}});g=o.find(e.close||".close");if(!g.length&&!e.close){g=b('<a class="close"></a>');o.prepend(g)}g.click(function(l){f.close(l)});e.load&&f.load()}b.tools=b.tools||{version:"@VERSION"};b.tools.overlay={addEffect:function(d,
e,f){h[d]=[e,f]},conf:{close:null,closeOnClick:true,closeOnEsc:true,closeSpeed:"fast",effect:"default",fixed:!b.browser.msie||b.browser.version>6,left:"center",load:false,mask:null,oneInstance:true,speed:"normal",target:null,top:"10%"}};var i=[],h={};b.tools.overlay.addEffect("default",function(d,e){var f=this.getConf(),k=b(window);if(!f.fixed){d.top+=k.scrollTop();d.left+=k.scrollLeft()}d.position=f.fixed?"fixed":"absolute";this.getOverlay().css(d).fadeIn(f.speed,e)},function(d){this.getOverlay().fadeOut(this.getConf().closeSpeed,
d)});b.fn.overlay=function(d){var e=this.data("overlay");if(e)return e;if(b.isFunction(d))d={onBeforeLoad:d};d=b.extend(true,{},b.tools.overlay.conf,d);this.each(function(){e=new q(b(this),d);i.push(e);b(this).data("overlay",e)});return d.api?e:this}})(jQuery);
(function(b){var q=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(i){b(".kbs.current",i).removeClass("current");var h=b(".domain-section:first",i),d=b(".domain-section:last",i),e=this.scroll_to=function(a){var c=b(document).scrollTop();b(document).height();var j=q().h;j=c+j;var n=a.offset().top;a=n+a.height();if(n<c)b(document).scrollTop(n);else a>j&&b(document).scrollTop(c+(a-j))},f=this.get_current=function(){return b(".kbs.current:first",i)},k=this.set_next=function(a,c,j){a=a||f();if(c.length){a.removeClass("current");c.addClass("current");
j||e(c)}},m=this.next_domain=function(a){var c=f(),j=g(c);if(j){j=j.find(".kbs:first");k(c,j,a)}},g=this._next_domain=function(a){if(!(a&&a.length))return b(".domain-section:first",i);a=a.closest(".domain-section");return!a.length||a[0]===d[0]?h:a.next(".domain-section")},o=this.prev_domain=function(){var a=f(),c=r(a);if(c){c=c.find(".kbs:first");k(a,c)}},r=this._prev_domain=function(a){if(!(a&&a.length))return b(".domain-section:last",i);var c=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return c;return!c.length||c[0]===h[0]?d:c.prev(".domain-section")},p=this.next_type=function(){var a=f(),c=v(a);if(c){c=c.find(".kbs:first");k(a,c)}},v=this._next_type=function(a){if(!(a&&a.length))return b(".type-section:first",i);var c=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):c.find(".type-section:first");if(!(a&&a.length)){var j=g(c);if(j)for(;j.get(0)!==c.get(0);){a=j.find(".type-section:first");if(a.length)break;
j=g(j)}}return a},s=this.prev_type=function(){var a=f(),c=l(a);if(c){c=c.find(".kbs:first");k(a,c)}},l=this._prev_type=function(a){if(!(a&&a.length))return b(".type-section:last",i);var c=a.closest(".domain-section"),j=a.closest(".type-section");if(a.closest(".property-section").length)return j;var n;if(j.length)n=j.prev(".type-section");if(!(n&&n.length))if(a=r(c))for(;a.get(0)!==c.get(0);){n=a.find(".type-section:last");if(n.length)break;a=r(a)}return n},t=this.next_prop=function(){var a=f(),c=
u(a);if(c){c=c.find(".kbs:first");k(a,c)}},u=this._next_prop=function(a){if(!(a&&a.length))return b(".property-section:first",i);var c=a.closest(".domain-section"),j=a.closest(".type-section"),n=a.closest(".property-section");c=n.length?n.next(".property-section"):j.length?j.find(".property-section:first"):c.find(".property-section:first");if(!(c&&c.length))if(a=v(a))for(;a.get(0)!==j.get(0);){c=a.find(".property-section:first");if(c.length)break;if(j.get(0)==null)j=a;a=v(a)}return c},x=this.prev_prop=
function(){var a=f(),c=z(a);if(c){c=c.find(".kbs:first");k(a,c)}},z=this._prev_prop=function(a){if(!(a&&a.length))return b(".property-section:last",i);var c=a.closest(".domain-section"),j=a.closest(".type-section"),n=a.closest(".property-section");if(a.closest(".data-section").length)return n;var w;if(n.length)w=n.prev(".property-section");if(!(w&&w.length))if(s=j.length?l(j):l(c))for(;s.get(0)!==j.get(0);){w=s.find(".property-section:last");if(w.length)break;if(j.get(0)==null)j=s;s=l(s)}return w};
this.next=function(){var a=f(),c=this._next(a);c&&k(a,c)};this._next=function(a){if(!(a&&a.length))return b(".domain-section:first .kbs:first",i);var c=a.closest(".domain-section"),j=a.closest(".type-section"),n=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=n.next(".property-section").find(".kbs:first");if(a.length)return a;a=j.next(".type-section").find(".kbs:first")}else if(n.length){a=n.find(".data-section:first .kbs:first");if(a.length)return a;
a=n.next(".property-section").find(".kbs:first");if(a.length)return a;a=j.next(".type-section").find(".kbs:first")}else if(j.length){a=j.find(".property-section:first .kbs:first");if(a.length)return a;a=j.next(".type-section").find(".kbs:first")}else a=c.find(".type-section:first .kbs:first");if(a.length)return a;return c.get(0)===d.get(0)?h.find(".kbs:first"):c.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=f(),c=this._prev(a);c&&k(a,c)};this._prev=function(a){if(!(a&&a.length)){a=
b(".data-section:last .kbs:last",i);a.length||(a=b(".property-section:last .kbs:first",i));a.length||(a=b(".type-section:last .kbs:first",i));a.length||(a=b(".domain-section:last .kbs:first",i));return a}var c=a.closest(".domain-section"),j=a.closest(".type-section"),n=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return n.find(".kbs:first")}else if(n.length){a=n.prev(".property-section").find(".kbs:last");if(a.length)return a;return j.find(".kbs:first")}else if(j.length){a=
j.prev(".type-section").find(".kbs:last");if(a.length)return a;return c.find(".kbs:first")}else return c.get(0)===h.get(0)?d.find(".kbs:last"):c.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var y=this;b(document).unbind(".kbs").bind("keydown.kbs",function(a){var c=a.target;if(c==document.body||c==document||c==window||c==b("html")[0]){c=a.keyCode;if(c===68)a.shiftKey?o():m();else if(c===84)a.shiftKey?s():p();else if(c===80)a.shiftKey?x():t();else if(c===
74)y.next();else if(c===75)y.prev();else c===69&&y.edit()}})}})(jQuery);
(function(b,q){var i=window.propbox={init:function(h,d){d=b.extend({lang:"/lang/en"},d);if(!d.base_ajax_url)throw new Error("base_ajax_url required in propbox options");if(!d.base_static_url)throw new Error("base_static_url required in propbox options");if(!d.id)throw new Error("topic id required in propbox options");if(!d.lang)throw new Error("lang required in propbox options");i.options=d;i.kbs=new q(h);i.kbs.set_next(i.kbs.get_current(),b(".kbs:visible:first",h,true));b(".kbs",h).live("click",
function(){var e=i.kbs.get_current();i.kbs.set_next(e,b(this),true)}).live("edit",function(){var e=b(this).find(".headmenu:first").data("submenu");e&&b("li:first a:first",e).click()});i.init_menus(h)},init_menus:function(h,d){h=b(h||document);d&&b(".nicemenu",h).nicemenu();(h&&h.is(".data-row")?h:b(".data-row",h)).hover(i.row_menu_hoverover,i.row_menu_hoverout);b(".nicemenu .headmenu",h).add(b(".nicemenu .default-action",h)).click("click",function(){if(i.kbs){var e=i.kbs.get_current();e&&i.kbs.set_next(e,
b(this).parents(".kbs:first"),true)}return false})},row_menu_hoverover:function(){var h=b(this);i.row_menu_hoverover.timeout=setTimeout(function(){h.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(i.row_menu_hoverover.timeout);b(this).removeClass("row-hover")},get_script:function(h,d){var e=i.get_script.cache;if(!e)e=i.get_script.cache={};var f=e[h];if(f)if(f.state===1)f.callbacks.push(d);else f.state===4&&d();else{f=e[h]={state:0,callbacks:[d]};b.ajax({url:i.options.base_static_url+
h,dataType:"script",beforeSend:function(){f.state=1},success:function(){f.state=4;b.each(f.callbacks,function(k,m){m()})},error:function(){f.state=-1}})}},prop_edit:function(h,d){var e=b(h).parents(".submenu").data("headmenu").parents(".property-section").find(".data-section .data-row:first:visible .nicemenu:first .headmenu:first a");e.length?e.click():i.prop_add(h,d);return false},prop_add:function(h,d){var e=b(h).parents(".submenu").data("headmenu").parents(".property-section");i.get_script("/propbox-edit.mf.js",
function(){i.edit.prop_add_begin(e,d)});return false},value_edit:function(h){var d=b(h).parents(".submenu").data("headmenu").parents(".data-row:first"),e=d.parents(".property-section");i.get_script("/propbox-edit.mf.js",function(){i.edit.value_edit_begin(e,d)});return false},value_delete:function(h){var d=b(h).parents(".submenu").data("headmenu").parents(".data-row:first"),e=d.parents(".property-section");i.get_script("/propbox-edit.mf.js",function(){i.edit.value_delete_begin(e,d)});return false},
close_message:function(h){b(h).parents(".row-msg:first").remove();return false}}})(jQuery,window.kbs);
(function(b,q,i){var h=q.formbuilder={init:function(){q.c.header&&b("#header").fadeIn();b(".nicemenu").nicemenu();i.init(null,{id:q.c.id,base_ajax_url:q.h.ajax_url("lib/propbox"),base_static_url:q.h.static_url("lib/propbox"),lang:q.lang||"/lang/en",suggest_impl:q.suggest_options,incompatible_types:q.incompatible_types});b(window).bind("fb.user.signedin",function(d,e){b("#signedin > a:first").text(e.name)})}};b(h.init)})(jQuery,window.freebase,window.propbox);
