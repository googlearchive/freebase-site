
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
(function(a){function f(b,c){this.options=a.extend(true,{},c);this.input=a(b);this.placeholder=this.input.attr("placeholder")||"";this.init()}if(!("placeholder"in document.createElement("input"))){var d=a.fn.val;a.fn.val=function(b){if(b===undefined)if(this.hasClass("placeholder"))return"";return d.apply(this,[b])};f.prototype={init:function(){var b=this,c=this.input.val();if(c===""||c===this.placeholder)this.input.val(this.placeholder).addClass("placeholder");this.input.bind("focus.placeholder",
function(e){return b.focus(e)}).bind("blur.placeholder",function(e){return b.blur(e)});this.input[0].form&&a(this.input[0].form).bind("submit",function(e){return b.submit(e)})},destroy:function(){this.input.unbind(".placeholder");this.input[0].form&&a(this.input[0].form).unbind(".placeholder")},focus:function(){this.input.hasClass("placeholder")&&this.input.val("").removeClass("placeholder")},blur:function(){this.input.val()===""&&this.input.val(this.input.attr("placeholder")).addClass("placeholder")},
submit:function(){this.input.hasClass("placeholder")&&this.input.val("")}};a.fn.placeholder=function(b){return this.each(function(){var c=a(this);c.unbind(".placeholder");if(c.is(":text")||c.is("textarea"))if(c.attr("placeholder")){(c=a.data(this,"placeholder"))&&c.destroy();a.data(this,"placeholder",new f(this,b))}})}}})(jQuery);
(function(a){a(function(){var f="placeholder"in document.createElement("input"),d=a("#text"),b=a("#textarea"),c=a("checkbox"),e=a("#form");QUnit.testStart=function(){a.each([d,b,c],function(){this.placeholder()})};QUnit.testDone=function(){a.each([d,b,c],function(){var g=this.data("placeholder");g&&g.destroy();this.val("")})};test("init",function(){if(f){ok(!d.data("placeholder"),"browser supports placeholder :text");ok(!b.data("placeholder"),"browser supports placeholder textarea")}else{ok(d.data("placeholder"),
"placeholder initialized :text");ok(b.data("placeholder"),"placeholder initialized textarea")}ok(!c.data("placeholder"),"placeholder n/a on checkbox")});if(!f){test("focus/blur",function(){a.each([d,b],function(){ok(this.hasClass("placeholder"));this.focus();ok(!this.hasClass("placeholder"));this.blur();ok(this.hasClass("placeholder"))})});test("submit",function(){equal(d[0].value,"text");equal(b[0].value,"textarea");e.submit(function(){equal(d[0].value,"");equal(d.val(),"");equal(b[0].value,"");
equal(b.val(),"");return false});e.submit()});test("val",function(){a.each([d,b],function(){equal(this.val(),"");equal(this[0].value,this.attr("placeholder"));this.focus();equal(this.val(),"");equal(this[0].value,"");this.blur();equal(this.val(),"");equal(this[0].value,this.attr("placeholder"))})})}})})(jQuery);
