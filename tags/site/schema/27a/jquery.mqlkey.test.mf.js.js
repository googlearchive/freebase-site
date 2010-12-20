
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
(function(f){function c(b,a){this.options=f.extend(true,{},c.defaults,a);this.options.jsonp=c.use_jsonp(this.options.mqlread_url);this.input=f(b);this.original=this.input.val();this.init()}f.fn.mqlkey=function(b){return this.each(function(){var a=f(this);if(a.is(":text")){var d=a.data("mqlkey");d&&d._destroy();d=new c(this,b);a.data("mqlkey",d)}})};var h=/^(\!)?(?:([a-z](?:_?[a-z0-9])*)\:)?(\/|\/?[a-z](?:_?[a-z0-9])*(?:\/[a-z](?:_?[a-z0-9])*)*)$/;c.prototype={init:function(){var b=this;this.input.bind("keyup.mqlkey",
function(a){b.textchange(a)}).bind(f.browser.msie?"paste.mqlkey":"input.mqlkey",function(a){b.textchange(a)});if(this.options.source){this.source=f(this.options.source);this.source_generate=true;this.input.bind("change.mqlkey",function(){b.source_generate=false});this.source.bind("change.mqlkey",function(){if(b.source_generate){var a=c.from(b.source.val());b.input.val(a).trigger("keyup")}})}},_destroy:function(){this.input.unbind(".mqlkey");this.source&&this.source.unbind("change.mqlkey")},textchange:function(b){clearTimeout(this.textchange_timeout);
var a=this;this.textchange_timeout=setTimeout(function(){a.textchange_delay(b)},0)},textchange_delay:function(){this.input.trigger("textchange");var b=f.trim(this.input.val());return b===this.original&&b!==""?this.valid(b):h.test(b)?b.length<this.options.minlen?this.invalid(b):this.options.check_key?this.check_key(b):this.valid(b):this.invalid(b)},check_key:function(b){var a=this;if(this.xhr){this.xhr.abort();this.xhr=null}var d={query:'{"query": {"id": null, "key": {"namespace": "'+this.options.namespace+
'", "value": "'+b+'"}}}'};clearTimeout(this.check_key.timeout);var g={url:this.options.mqlread_url,data:d,success:function(e){if(e.code==="/api/status/ok")return e.result?a.invalid(b,"Key already exists"):a.valid(b)},error:function(e){if(e)return a.invalid(e.responseText())},dataType:a.options.jsonp?"jsonp":"json"};this.check_key.timeout=setTimeout(function(){a.ac_xhr=f.ajax(g)},200)},valid:function(b){this.input.trigger("valid",b)},invalid:function(b,a){if(!a){a=this.options.minlen>1?"Key must be "+
this.options.minlen+" or more alphanumeric characters":"Key must be alphanumeric";a+=", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively."}this.input.trigger("invalid",a)}};f.extend(c,{defaults:{minlen:1,check_key:true,namespace:"/",mqlread_url:"http://www.freebase.com/api/service/mqlread",source:null},use_jsonp:function(b){if(!b)return false;var a=window.location.href;a=a.substr(0,a.length-window.location.pathname.length);
if(a===b)return false;return true},from:function(b){b=b.toLowerCase();b=b.replace(/[^a-z0-9]/g,"_");b=b.replace(/\_\_+/g,"_");b=b.replace(/[^a-z0-9]+$/,"");return b=b.replace(/^[^a-z]+/,"")}})})(jQuery);
(function(f){f(function(){var c,h;QUnit.testStart=function(){c=f("#key");h=f("#source")};test("init",function(){var a=c.mqlkey().data("mqlkey");ok(a,"mqlkey initialized")});var b={valid:["a","abcd","e_f","h_4","i_1_j","e345","l_m_o_p_3r4"],invalid:["","1","-","_","-_-","a__b","c--d","a!@#$%^&*()","1abc","_abc","-abc","abc_","abc-"]};test("valid keys check_key=true",b.valid.length,function(){c.mqlkey({check_key:true});var a=b.valid,d=0;c.bind("valid",function(g,e){ok(true,"valid: "+e);d<a.length?c.val(a[d++]).trigger("keyup"):
start()}).bind("invalid",function(g,e){ok(false,"valid expected: "+e);start()});stop(5E3);c.val(a[d++]).trigger("keyup")});test("valid keys check_key=false",b.valid.length,function(){c.mqlkey({check_key:false});var a=b.valid,d=0;c.bind("valid",function(g,e){ok(true,"valid: "+e);d<a.length?c.val(a[d++]).trigger("keyup"):start()}).bind("invalid",function(g,e){ok(false,"valid expected: "+e);start()});stop(5E3);c.val(a[d++]).trigger("keyup")});test("invalid keys check_key=true",b.invalid.length,function(){c.mqlkey({check_key:true});
var a=b.invalid,d=0;c.bind("valid",function(g,e){ok(false,"invalid expected: "+e);start()}).bind("invalid",function(g,e){ok(true,"invalid: "+e);d<a.length?c.val(a[d++]).trigger("keyup"):start()});stop(5E3);c.val(a[d++]).trigger("keyup")});test("invalid keys check_key=false",b.invalid.length,function(){c.mqlkey({check_key:false});var a=b.invalid,d=0;c.bind("valid",function(g,e){ok(false,"invalid expected: "+e);start()}).bind("invalid",function(g,e){ok(true,"invalid: "+e);d<a.length?c.val(a[d++]).trigger("keyup"):
start()});stop(5E3);c.val(a[d++]).trigger("keyup")});test("valid minlen",1,function(){c.mqlkey({minlen:5,check_key:false});c.bind("valid",function(a,d){ok(true,"valid: "+d);start()});stop(5E3);c.val("abcde").trigger("keyup")});test("invalid minlen",1,function(){c.mqlkey({minlen:5,check_key:false});c.bind("invalid",function(a,d){ok(true,"invalid: "+d);start()});stop(5E3);c.val("abcd").trigger("keyup")});test("valid check_key",1,function(){c.mqlkey({check_key:true,namespace:"/"});c.bind("valid",function(a,
d){ok(true,"valid: "+d);start()});stop(5E3);c.val("foobar").trigger("keyup")});test("invalid check_key",1,function(){c.mqlkey({check_key:true,namespace:"/"});c.bind("invalid",function(a,d){ok(true,"invalid: "+d);start()});stop(5E3);c.val("film").trigger("keyup")});test("valid source",2,function(){c.mqlkey({check_key:true,namespace:"/",source:"#source"});c.bind("valid",function(a,d){equal(d,"foo_bar","valid");equal(c.val(),"foo_bar","valid");start()});stop(5E3);h.val("1Foo-Bar-").trigger("change")});
test("invalid source",1,function(){c.mqlkey({check_key:true,namespace:"/",source:h});c.bind("invalid",function(a,d){ok(true,"invalid:"+d);start()});stop(5E3);h.val("Film").trigger("change")})})})(jQuery);
