
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
(function(d){var k="undefined"!=typeof window.innerWidth?function(){return{w:window.innerWidth,h:window.innerHeight}}:"undefined"!=typeof document.documentElement&&"undefined"!=typeof document.documentElement.clientWidth&&0!=document.documentElement.clientWidth?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}};window.kbs=
function(e){d(".kbs.current",e).removeClass("current");var c=d(".domain-section:first",e),f=d(".domain-section:last",e),g=this.scroll_to=function(a){var b=d(document).scrollTop();d(document).height();var l=k().h,l=b+l,e=a.offset().top,a=e+a.height();e<b?d(document).scrollTop(e):a>l&&d(document).scrollTop(b+(a-l))},h=this.get_current=function(){return d(".kbs.current:first",e)},i=this.set_next=function(a,b,d){a=a||h();b.length&&(a.removeClass("current"),b.addClass("current"),d||g(b))},r=this.next_domain=
function(a){var b=h(),d=n(b);d&&(d=d.find(".kbs:first"),i(b,d,a))},n=this._next_domain=function(a){if(!a||!a.length)return d(".domain-section:first",e);a=a.closest(".domain-section");return!a.length||a[0]===f[0]?c:a.next(".domain-section")},s=this.prev_domain=function(){var a=h(),b=o(a);b&&(b=b.find(".kbs:first"),i(a,b))},o=this._prev_domain=function(a){if(!a||!a.length)return d(".domain-section:last",e);var b=a.closest(".domain-section");return a.closest(".property-section").length||a.closest(".type-section").length?
b:!b.length||b[0]===c[0]?f:b.prev(".domain-section")},t=this.next_type=function(){var a=h(),b=p(a);b&&(b=b.find(".kbs:first"),i(a,b))},p=this._next_type=function(a){if(!a||!a.length)return d(".type-section:first",e);var b=a.closest(".domain-section"),a=a.closest(".type-section"),a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!a||!a.length){var c=n(b);if(c)for(;c.get(0)!==b.get(0);){a=c.find(".type-section:first");if(a.length)break;c=n(c)}}return a},j=this.prev_type=function(){var a=
h(),b=m(a);b&&(b=b.find(".kbs:first"),i(a,b))},m=this._prev_type=function(a){if(!a||!a.length)return d(".type-section:last",e);var b=a.closest(".domain-section"),c=a.closest(".type-section");if(a.closest(".property-section").length)return c;var f;c.length&&(f=c.prev(".type-section"));if(!f||!f.length)if(a=o(b))for(;a.get(0)!==b.get(0);){f=a.find(".type-section:last");if(f.length)break;a=o(a)}return f},v=this.next_prop=function(){var a=h(),b=u(a);b&&(b=b.find(".kbs:first"),i(a,b))},u=this._next_prop=
function(a){if(!a||!a.length)return d(".property-section:first",e);var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section"),b=f.length?f.next(".property-section"):c.length?c.find(".property-section:first"):b.find(".property-section:first");if(!b||!b.length)if(a=p(a))for(;a.get(0)!==c.get(0);){b=a.find(".property-section:first");if(b.length)break;null==c.get(0)&&(c=a);a=p(a)}return b},x=this.prev_prop=function(){var a=h(),b=w(a);b&&(b=b.find(".kbs:first"),i(a,
b))},w=this._prev_prop=function(a){if(!a||!a.length)return d(".property-section:last",e);var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section");if(a.closest(".data-section").length)return f;var g;f.length&&(g=f.prev(".property-section"));if(!g||!g.length)if(j=c.length?m(c):m(b))for(;j.get(0)!==c.get(0);){g=j.find(".property-section:last");if(g.length)break;null==c.get(0)&&(c=j);j=m(j)}return g};this.next=function(){var a=h(),b=this._next(a);b&&i(a,b)};this._next=
function(a){if(!a||!a.length)return d(".domain-section:first .kbs:first",e);var b=a.closest(".domain-section"),g=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=h.next(".property-section").find(".kbs:first");if(a.length)return a;a=g.next(".type-section").find(".kbs:first")}else if(h.length){a=h.find(".data-section:first .kbs:first");if(a.length)return a;a=h.next(".property-section").find(".kbs:first");if(a.length)return a;
a=g.next(".type-section").find(".kbs:first")}else if(g.length){a=g.find(".property-section:first .kbs:first");if(a.length)return a;a=g.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");return a.length?a:b.get(0)===f.get(0)?c.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=h(),b=this._prev(a);b&&i(a,b)};this._prev=function(a){if(!a||!a.length)return a=d(".data-section:last .kbs:last",e),a.length||(a=d(".property-section:last .kbs:first",
e)),a.length||(a=d(".type-section:last .kbs:first",e)),a.length||(a=d(".domain-section:last .kbs:first",e)),a;var b=a.closest(".domain-section"),g=a.closest(".type-section"),h=a.closest(".property-section");return a.closest(".data-section").length?(a=a.prev(".kbs"),a.length?a:h.find(".kbs:first")):h.length?(a=h.prev(".property-section").find(".kbs:last"),a.length?a:g.find(".kbs:first")):g.length?(a=g.prev(".type-section").find(".kbs:last"),a.length?a:b.find(".kbs:first")):b.get(0)===c.get(0)?f.find(".kbs:last"):
b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var q=this;d(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==d("html")[0])b=a.keyCode,68===b?a.shiftKey?s():r():84===b?a.shiftKey?j():t():80===b?a.shiftKey?x():v():74===b?q.next():75===b?q.prev():69===b&&q.edit()})}})(jQuery);
(function(d,k){var e=window.propbox={init:function(c,f){f=d.extend({lang:"/lang/en"},f);if(!f.base_ajax_url)throw Error("base_ajax_url required in propbox options");if(!f.base_static_url)throw Error("base_static_url required in propbox options");if(!f.id)throw Error("topic id required in propbox options");if(!f.lang)throw Error("lang required in propbox options");e.options=f;e.kbs=new k(c);e.kbs.set_next(e.kbs.get_current(),d(".kbs:visible:first",c,!0));d(".kbs",c).live("click",function(){var c=e.kbs.get_current();
e.kbs.set_next(c,d(this),!0)}).live("edit",function(){var c=d(this).find(".headmenu:first").data("submenu");c&&d("li:first a:first",c).click()});e.init_menus(c)},init_menus:function(c,f){c=d(c||document);f&&d(".nicemenu",c).nicemenu();(c&&c.is(".data-row")?c:d(".data-row",c)).hover(e.row_menu_hoverover,e.row_menu_hoverout);d(".nicemenu .headmenu",c).add(d(".nicemenu .default-action",c)).click("click",function(){if(e.kbs){var c=e.kbs.get_current();c&&e.kbs.set_next(c,d(this).parents(".kbs:first"),
!0)}return!1})},row_menu_hoverover:function(){var c=d(this);e.row_menu_hoverover.timeout=setTimeout(function(){c.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(e.row_menu_hoverover.timeout);d(this).removeClass("row-hover")},get_script:function(c,f){var g=e.get_script.cache;g||(g=e.get_script.cache={});var h=g[c];h?1===h.state?h.callbacks.push(f):4===h.state&&f():(h=g[c]={state:0,callbacks:[f]},d.ajax({url:e.options.base_static_url+c,dataType:"script",beforeSend:function(){h.state=
1},success:function(){h.state=4;d.each(h.callbacks,function(c,d){d()})},error:function(){h.state=-1}}))},prop_edit:function(c,f){var g=d(c).parents(".submenu").data("headmenu").parents(".property-section").find(".data-section .data-row:first:visible .nicemenu:first .headmenu:first a");g.length?g.click():e.prop_add(c,f);return!1},prop_add:function(c,f){var g=d(c).parents(".submenu").data("headmenu").parents(".property-section");e.get_script("/propbox-edit.mf.js",function(){e.edit.prop_add_begin(g,
f)});return!1},value_edit:function(c){var f=d(c).parents(".submenu").data("headmenu").parents(".data-row:first"),g=f.parents(".property-section");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_edit_begin(g,f)});return!1},value_delete:function(c){var f=d(c).parents(".submenu").data("headmenu").parents(".data-row:first"),g=f.parents(".property-section");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_delete_begin(g,f)});return!1},close_message:function(c){d(c).parents(".row-msg:first").remove();
return!1}}})(jQuery,window.kbs);(function(d,k,e){k.schema={init_modal_help:function(c){d(".modal-help-toggle",c).click(function(){var c=d(this),e=c.parents().find(".modal-help"),h=c.parents().find(".modal-content");e.is(":hidden")?(e.height(h.height()-5).slideDown(),c.html("[ - ] Hide Help")):(e.slideUp(),c.html("[ + ] Show Help"))})}};d(function(){e.init_menus()})})(jQuery,window.freebase,window.propbox);
