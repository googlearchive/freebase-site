
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
(function(c){c.factory=function(i,f){if(c.fn[i])throw"$.fn."+i+" plugin already exists";else if(c[i])throw"$."+i+" class already exists";c.fn[i]=function(e){return this.each(function(){var g=c(this),k=g.data("$."+i);k&&k._destroy();k=new c[i](g,e);g.data("$."+i,k)})};c[i]=function(e,g){this.options=c.extend(true,{},c[i].defaults,g);this.element=e;this.init()};c.extend(c[i].prototype,{init:function(){},_destroy:function(){}},f);return c[i]}})(jQuery);
(function(c){function i(f){(f||c(".submenu:visible")).fadeOut(function(){c(this).prev(".headmenu").removeClass("expanded")})}c.factory("nicemenu",{init:function(){var f=this.element.height();c(".headmenu .default-action",this.element).click(function(e){console.log("default-action");e.stopPropagation();i();c(this).parents(".headmenu").next(".submenu").find("a:first").click()});c(".headmenu",this.element).click(function(e){e.stopPropagation();var g=c(this);e=g.next(".submenu").css("top",f);if(e.is(":visible"))i(e);
else{i();e.fadeIn(function(){g.addClass("expanded")})}});c(".submenu",this.element).click(function(e){e.stopPropagation();i(c(this));c(this).fadeOut(function(){c(this).prev(".headmenu").removeClass("expanded")})})}});c(document).click(function(){i()})})(jQuery);
(function(c){var i=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(f){c(".kbs.current",f).removeClass("current");var e=c(".domain-section:first",f),g=c(".domain-section:last",f),k=this.scroll_to=function(a){var b=c(document).scrollTop();c(document).height();var d=i().h;d=b+d;var h=a.offset().top;a=h+a.height();if(h<b)c(document).scrollTop(h);else a>d&&c(document).scrollTop(b+(a-d))},j=this.get_current=function(){return c(".kbs.current:first",f)},l=this.set_next=function(a,b,d){if(b.length){a.removeClass("current");b.addClass("current");d||k(b)}},
q=this.next_domain=function(a){var b=j(),d=p(b);if(d){d=d.find(".kbs:first");l(b,d,a)}},p=this._next_domain=function(a){if(!(a&&a.length))return c(".domain-section:first",f);a=a.closest(".domain-section");return!a.length||a[0]===g[0]?e:a.next(".domain-section")},u=this.prev_domain=function(){var a=j(),b=r(a);if(b){b=b.find(".kbs:first");l(a,b)}},r=this._prev_domain=function(a){if(!(a&&a.length))return c(".domain-section:last",f);var b=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return b;return!b.length||b[0]===e[0]?g:b.prev(".domain-section")},v=this.next_type=function(){var a=j(),b=s(a);if(b){b=b.find(".kbs:first");l(a,b)}},s=this._next_type=function(a){if(!(a&&a.length))return c(".type-section:first",f);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var d=p(b);if(d)for(;d.get(0)!==b.get(0);){a=d.find(".type-section:first");if(a.length)break;
d=p(d)}}return a},m=this.prev_type=function(){var a=j(),b=o(a);if(b){b=b.find(".kbs:first");l(a,b)}},o=this._prev_type=function(a){if(!(a&&a.length))return c(".type-section:last",f);var b=a.closest(".domain-section"),d=a.closest(".type-section");if(a.closest(".property-section").length)return d;var h;if(d.length)h=d.prev(".type-section");if(!(h&&h.length))if(a=r(b))for(;a.get(0)!==b.get(0);){h=a.find(".type-section:last");if(h.length)break;a=r(a)}return h},x=this.next_prop=function(){var a=j(),b=
w(a);if(b){b=b.find(".kbs:first");l(a,b)}},w=this._next_prop=function(a){if(!(a&&a.length))return c(".property-section:first",f);var b=a.closest(".domain-section"),d=a.closest(".type-section"),h=a.closest(".property-section");b=h.length?h.next(".property-section"):d.length?d.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=s(a))for(;a.get(0)!==d.get(0);){b=a.find(".property-section:first");if(b.length)break;if(d.get(0)==null)d=a;a=s(a)}return b},z=this.prev_prop=
function(){var a=j(),b=y(a);if(b){b=b.find(".kbs:first");l(a,b)}},y=this._prev_prop=function(a){if(!(a&&a.length))return c(".property-section:last",f);var b=a.closest(".domain-section"),d=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length)return h;var n;if(h.length)n=h.prev(".property-section");if(!(n&&n.length))if(m=d.length?o(d):o(b))for(;m.get(0)!==d.get(0);){n=m.find(".property-section:last");if(n.length)break;if(d.get(0)==null)d=m;m=o(m)}return n};
this.next=function(){var a=j(),b=this._next(a);b&&l(a,b)};this._next=function(a){if(!(a&&a.length))return c(".domain-section:first .kbs:first",f);var b=a.closest(".domain-section"),d=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=h.next(".property-section").find(".kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else if(h.length){a=h.find(".data-section:first .kbs:first");if(a.length)return a;
a=h.next(".property-section").find(".kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else if(d.length){a=d.find(".property-section:first .kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===g.get(0)?e.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=j(),b=this._prev(a);b&&l(a,b)};this._prev=function(a){if(!(a&&a.length)){a=
c(".data-section:last .kbs:last",f);a.length||(a=c(".property-section:last .kbs:first",f));a.length||(a=c(".type-section:last .kbs:first",f));a.length||(a=c(".domain-section:last .kbs:first",f));return a}var b=a.closest(".domain-section"),d=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return h.find(".kbs:first")}else if(h.length){a=h.prev(".property-section").find(".kbs:last");if(a.length)return a;return d.find(".kbs:first")}else if(d.length){a=
d.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===e.get(0)?g.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var t=this;c(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==c("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?u():q();else if(b===84)a.shiftKey?m():v();else if(b===80)a.shiftKey?z():x();else if(b===
74)t.next();else if(b===75)t.prev();else b===69&&t.edit()}})}})(jQuery);
(function(c,i){var f=window.propbox={init:function(e,g){g=c.extend({lang:"/lang/en"},g);if(!g.base_url)throw new Error("base_url required in propbox options");if(!g.id)throw new Error("topic id required in propbox options");if(!g.lang)throw new Error("lang required in propbox options");f.options=g;f.kbs=new i(e);f.kbs.next();c(".kbs",e).live("click",function(){var k=f.kbs.get_current();f.kbs.set_next(k,c(this),true)}).live("edit",function(){c(this).find(".submenu:first a").click()}).hover(f.row_menu_hoverover,
f.row_menu_hoverout);c(".nicemenu",e).nicemenu()},row_menu_hoverover:function(){var e=c(this);f.row_menu_hoverover.timeout=setTimeout(function(){e.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(f.row_menu_hoverover.timeout);c(this).removeClass("row-hover")},get_script:function(e,g){var k=f.get_script.cache;if(!k)k=f.get_script.cache={};var j=k[e];if(j)if(j.state===1)j.callbacks.push(g);else j.state===4&&g();else{j=k[e]={state:0,callbacks:[g]};c.ajax({url:f.options.base_url+
e,dataType:"script",beforeSend:function(){j.state=1},success:function(){j.state=4;c.each(j.callbacks,function(l,q){q()})},error:function(){j.state=-1}})}},prop_edit:function(e){c(e).parents(".property-section").find(".data-section .data-row:first .combo-menu .head-menu-item:first a").click();return false},prop_add:function(e){var g=c(e).parents(".property-section");if(g.is(".editing"))return false;g.addClass("editing");f.get_script("/propbox-edit.mf.js",function(){f.edit.prop_add_begin(g)});return false},
value_edit:function(e){var g=c(e).parents(".data-row:first"),k=g.parents(".property-section");if(k.is(".editing"))return false;k.addClass("editing");f.get_script("/propbox-edit.mf.js",function(){f.edit.value_edit_begin(k,g)});return false},value_delete:function(e){e=c(e).parents(".combo-menu:first").prev(".property-value");var g=e.parents(".data-row:first");g.is("tr")?console.log("value_edit CVT",g.attr("data-id")):console.log("value_edit",e.attr("data-id")||e.attr("data-value"));if(g.parents(".property-section").is(".editing"))return false;
return false}}})(jQuery,window.kbs);
