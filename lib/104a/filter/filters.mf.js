
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
 
 jQuery Tools @VERSION Tooltip - UI essentials

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tooltip/

 Since: November 2008
 Date: @DATE 
*/
(function(a){a.factory("collapse_module",{init:function(){var d=this;this.$column=a(this.options.column);this.modules=a(this.options.modules,this.element);this.first_module=this.modules.get(0);this.trigger=a(".trigger:first",this.first_module);this.first_section=a(".module-section",this.first_module);this.other_modules=this.modules.slice(1);this.column_offset=this.$column.css("margin-left");this.set_collapsed(this.options.collapsed);this.trigger.click(function(a){return d.toggle(a)})},set_collapsed:function(a){(this.toggle_state=
a)?(this.trigger.addClass("collapsed"),this.$column.css("margin-left",0),this.first_section.hide(),this.other_modules.hide()):(this.trigger.removeClass("collapsed"),this.$column.css("margin-left",this.column_offset),this.first_section.show(),this.other_modules.show())},toggle:function(){var d=this;this.toggle_state?(a.localstore("filters_collapsed",0,!1),this.trigger.removeClass("collapsed"),this.$column.animate({marginLeft:this.column_offset},function(){d.first_section.slideDown(function(){d.modules.removeClass("collapsed")});
d.other_modules.fadeIn()})):(a.localstore("filters_collapsed",1,!1),this.trigger.addClass("collapsed"),this.other_modules.fadeOut(),this.first_section.slideUp(function(){d.$column.animate({marginLeft:0});d.modules.addClass("collapsed")}));this.toggle_state=!this.toggle_state;this.options.toggle_callback&&this.options.toggle_callback.call(this.trigger,this.toggle_state);return!1}});var g=a("body").is(".embed")||a.localstore("filters_collapsed");a.extend(!0,a.collapse_module,{defaults:{collapsed:null===
g?!1:!!g,modules:".module",column:"#main-column"}})})(jQuery);
(function(a){function g(b,c,a){var d=a.relative?b.position().top:b.offset().top,f=a.relative?b.position().left:b.offset().left,h=a.position[0],d=d-(c.outerHeight()-a.offset[0]),f=f+(b.outerWidth()+a.offset[1]),g=c.outerHeight()+b.outerHeight();"center"==h&&(d+=g/2);"bottom"==h&&(d+=g);h=a.position[1];b=c.outerWidth()+b.outerWidth();"center"==h&&(f-=b/2);"left"==h&&(f-=b);return{top:d,left:f}}function d(b,c){var e=this,d=b.add(e),f,h=0,o=0,m=b.attr("title"),p=n[c.effect],k,q=b.is(":input"),s=q&&b.is(":checkbox, :radio, select, :button, :submit"),
r=b.attr("type"),l=c.events[r]||c.events[q?s?"widget":"input":"def"];if(!p)throw'Nonexistent effect "'+c.effect+'"';l=l.split(/,\s*/);if(2!=l.length)throw"Tooltip: bad events configuration for "+r;b.bind(l[0],function(a){clearTimeout(h);c.predelay?o=setTimeout(function(){e.show(a)},c.predelay):e.show(a)}).bind(l[1],function(a){clearTimeout(o);c.delay?h=setTimeout(function(){e.hide(a)},c.delay):e.hide(a)});m&&c.cancelDefault&&(b.removeAttr("title"),b.data("title",m));a.extend(e,{show:function(j){if(!f){if(m)f=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(m);else if(c.tip)f=a(c.tip).eq(0);else{f=b.next();f.length||(f=b.parent().next())}if(!f.length)throw"Cannot find tooltip for "+b;}if(e.isShown())return e;f.stop(true,true);var i=g(b,f,c),j=j||a.Event();j.type="onBeforeShow";d.trigger(j,[i]);if(j.isDefaultPrevented())return e;i=g(b,f,c);f.css({position:"absolute",top:i.top,left:i.left});k=true;p[0].call(e,function(){j.type="onShow";k="full";d.trigger(j)});i=c.events.tooltip.split(/,\s*/);
f.bind(i[0],function(){clearTimeout(h);clearTimeout(o)});i[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&f.bind(i[1],function(a){a.relatedTarget!=b[0]&&b.trigger(l[1].split(" ")[0])});return e},hide:function(b){if(!f||!e.isShown())return e;b=b||a.Event();b.type="onBeforeHide";d.trigger(b);if(!b.isDefaultPrevented()){k=false;n[c.effect][1].call(e,function(){b.type="onHide";k=false;d.trigger(b)});return e}},isShown:function(a){return a?k=="full":k},getConf:function(){return c},getTip:function(){return f},
getTrigger:function(){return b}});a.each(["onHide","onBeforeShow","onShow","onBeforeHide"],function(b,d){a.isFunction(c[d])&&a(e).bind(d,c[d]);e[d]=function(b){a(e).bind(d,b);return e}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:!1,cancelDefault:!0,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,c,d){n[a]=[c,d]}};var n={toggle:[function(a){var c=this.getConf(),d=this.getTip(),c=c.opacity;1>c&&d.css({opacity:c});d.show();a.call()},function(a){this.getTip().hide();a.call()}],fade:[function(a){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(!0,{},a.tools.tooltip.conf,b);
"string"==typeof b.position&&(b.position=b.position.split(/,?\s/));this.each(function(){c=new d(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,g){g.filters={init_domain_type_property_filter:function(d){a(":text[name=domain], :text[name=type], :text[name=property]",d).suggest(a.extend({scoring:"schema",format:null,mql_output:JSON.stringify([{id:null,name:null,type:{id:null,"id|=":["/type/domain","/type/type","/type/property"],limit:1}}])},g.suggest_options.any("type:/type/domain","type:/type/type","type:/type/property"))).bind("fb-select",function(d,b){var c=a(this);c.val(b.id);var e=b.type.id;"/type/domain"===e?c.attr("name",
"domain"):"/type/type"===e?c.attr("name","type"):"/type/property"===e&&c.attr("name","property");this.form.submit()}).parents(".filter-form").submit(function(){return!1})}};a(function(){a(".filter-form :input").keypress(function(a){13===a.keyCode&&this.form.submit();return!0});a(".filter-help-trigger").tooltip({events:{def:"click,mouseout"},position:"top center",effect:"fade",delay:300,offset:[-8,0]});a(".filter-form-trigger").click(function(){var d=a(this).siblings(".filter-form");d.is(":hidden")?
d.slideDown(function(){a(":text:first",d).focus()}):d.slideUp()})})})(jQuery,window.freebase);
