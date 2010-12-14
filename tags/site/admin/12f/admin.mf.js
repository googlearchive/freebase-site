
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
(function(a){a.fn.showRow=function(c,e,b){e=e==="fadeIn"?"fadeIn":"slideDown";var h=this;return this.each(function(){var f=a(this).hide(),d=a("> td, > th",f).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();f.show();d[e](b,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c&&c.call(h)})})};a.fn.hideRow=function(c,e,b){e=e==="fadeOut"?"fadeOut":"slideUp";var h=this;return this.each(function(){var f=a(this).show(),d=a("> td, > th",f).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[e](b,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});f.hide();c&&c.call(h)})})}})(jQuery);var global_results={total_tests:0,total_failed:0,total_apps:0},html_id=function(a){return a.replace(/[\/\.]/g,"")},rown=0;$(".summary").each(function(){load_app_summary($(this).attr("app_id"),rown++);global_results.total_apps++});$("#release-all").click(function(){$(".release").each(function(){$(this).click()});return false});
$("#test-all").click(function(){global_results.total_tests=0;global_results.total_failed=0;$(".test").each(function(){$(this).click()});return false});function load_app_summary(a,c){c||(c=0);$("#summary-"+a).load($("#summary-"+a).attr("app_url")+"&rown="+c,[],function(){bind_app_buttons(a)})}
function bind_app_buttons(a){$("#release-"+a).click(function(){app_html_id=$(this).attr("app_html_id");$.ajax({url:$(this).attr("href"),data:{appid:$(this).attr("app_id"),version:$(this).attr("app_version")},type:"POST",dataType:"json",success:function(b){$("#message").html("App "+b.result.appid+" version "+b.result.release+" has been released.");load_app_summary(app_html_id)},beforeSend:function(b){b.setRequestHeader("X-Requested-With","XMLHttpRequest")}});return false});var c=function(b){var h=
html_id(b.app_path),f="<b>"+b.testfiles[0].file+"</b>",d="",i=0,j=0,k="test-passed";for(var m in b.testfiles[0].modules[0].tests){i++;global_results.total_tests++;var g=b.testfiles[0].modules[0].tests[m];d+="<br/><span class='"+(g.failures?"test-failed":"test-passed")+"'>"+g.name+": "+parseInt(parseInt(g.total)-parseInt(g.failures))+"/"+g.total;if(g.failures){k="test-failed";j++;global_results.total_failed++;for(var n in g.log){var l=g.log[n];if(l.result!=true)d+="<br/><i>"+l.message+"</i>"}}d+="</span>"}f+=
"<br/>"+parseInt(i-j)+"/"+i+" passed";$("#messages-"+h).append("<table style='margin-top: 10px;'><tr><td width='60px' class='"+k+"'>"+f+"</td><td width='130px'>"+d+"</td></tr></table>");$("#message").html("Total Tests: "+global_results.total_tests+" Failed: "+global_results.total_failed)},e=function(b){if(b.testfiles.length==0){b=html_id(b.app_path);$("#messages-"+b).append("(no tests)")}else for(var h in b.testfiles){testfile=b.testfiles[h];$.ajax({url:testfile.run_url,data:{output:"json"},type:"GET",
dataType:"jsonp",success:c})}};$("#test-"+a).bind("click",function(){$.ajax({url:$(this).attr("href"),data:{output:"json",mode:"discover"},type:"GET",dataType:"jsonp",success:e});return false})};
