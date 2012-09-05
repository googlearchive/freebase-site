
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
(function(m){jQuery&&jQuery(window).trigger("acre.template.register",{pkgid:"//52b.data.www.tags.svn.freebase-site.googlecode.dev/user.mjt",source:{def:function(){var q=function(){var d=this.tpackage,p=this.exports,c=d._template_fragments,j=d.runtime.new_markuplist(),k=0;j[k++]=c[0];var f=this.exports.c={},n=m.require("lib/helper/helpers.sjs");m.require("lib/template/imagecomponents");var l=m.require("lib/i18n/i18n.sjs"),o=m.require("lib/i18n/components.mjt"),g=l.gettext;j[k++]=c[1];var e=function(){return d.runtime.new_markuplist()};
e=d.runtime.tfunc_factory("head()",e,d,undefined,false);p.head=e;e.source_microdata=null;j[k++]=c[2];e=function(){var a=d.runtime.new_markuplist(),b=0;a[b++]=c[3];if(f.owned_domains&&f.owned_domains.length){a[b++]=c[4];a[b++]=g("Create new");a[b++]=c[5];a[b++]=n.template_sprintf(g("%s owns %s domains"),l.display_name(f.object),o.number(f.owned_domains.length));a[b++]=c[6];a[b++]=g("Name");a[b++]=c[7];a[b++]=g("Since");a[b++]=c[8];d.runtime.foreach(this,f.owned_domains,function(r,h){for(var i=1;i;){a[b++]=
c[9];a[b++]=d.runtime.make_attr_safe(n.fb_url(h.id),true);a[b++]=c[10];a[b++]=l.display_name(h);a[b++]=c[11];a[b++]=o.datetime(h["/type/domain/owners"].member.link.timestamp,[["class","published"]],"d");a[b++]=c[12];i--}return i?d.runtime._break_token:d.runtime._continue_token});a[b++]=c[13]}a[b++]=c[14];if(f.watched_domains&&f.watched_domains.length){a[b++]=c[15];a[b++]=n.template_sprintf(g("%s is watching %s domains"),l.display_name(f.object),o.number(f.watched_domains.length));a[b++]=c[16];a[b++]=
g("Name");a[b++]=c[17];a[b++]=g("Since");a[b++]=c[18];d.runtime.foreach(this,f.watched_domains,function(r,h){for(var i=1;i;){a[b++]=c[19];a[b++]=d.runtime.make_attr_safe(n.fb_url(h.id),true);a[b++]=c[20];a[b++]=l.display_name(h);a[b++]=c[21];a[b++]=o.datetime(h["!/freebase/user_profile/favorite_domains"].link.timestamp,[["class","published"]],"d");a[b++]=c[22];i--}return i?d.runtime._break_token:d.runtime._continue_token});a[b++]=c[23]}a[b++]=c[24];return a};e=d.runtime.tfunc_factory("page_content()",
e,d,undefined,false);p.page_content=e;e.source_microdata=null;j[k++]=c[25];e=function(){var a=d.runtime.new_markuplist(),b=0;a[b++]=c[26];return a};e=d.runtime.tfunc_factory("footer_script()",e,d,undefined,false);p.footer_script=e;e.source_microdata=null;j[k++]=c[27];return j};q.source_microdata=null;return q}(),info:{file:"//52b.data.www.tags.svn.freebase-site.googlecode.dev/user.mjt",stringtable:["","","","",'\n    <div class="table-header">\n      <div class="button-group edit">\n        <a class="button primary" href="#" id="create-domain">',
'</a>\n      </div>\n      <h2 class="table-title">','</h2>\n    </div>\n    <table cellspacing="0" class="table table-sortable">\n      <thead>\n        <tr>\n          <th class="column-header first {sorter: \'ignoreCase\'}" scope="column"><span class="sort-icon">','</span></th>\n          <th class="column-header {sorter: \'datetime\'}" scope="column"><span class="sort-icon">',"</span></th>\n        </tr>\n      </thead>\n      <tbody>",'\n        <tr>\n          <th class="row-header odd first">\n            <a href="',
'">',"</a>\n          </th>\n          <td>\n            ","\n          </td>\n        </tr>","\n      </tbody>\n    </table>","",'\n    <h2 class="table-title">','</h2>\n    <table cellspacing="0" class="table table-sortable">\n      <thead>\n        <tr>\n          <th class="column-header first {sorter: \'ignoreCase\'}" scope="column"><span class="sort-icon">','</span></th>\n          <th class="column-header {sorter: \'datetime\'}" scope="column"><span class="sort-icon">',"</span></th>\n        </tr>\n      </thead>\n      <tbody>",
'\n        <tr>\n          <th class="row-header odd first">\n            <a href="','">',"</a>\n          </th>\n          <td>\n            ","\n          </td>\n        </tr>","\n      </tbody>\n    </table>","","",'\n  <script src="/static/81b.lib.www.tags.svn.freebase-site.googlecode.dev/template/jquery.tablesorter.js"><\/script>\n  <script src="/static/52b.data.www.tags.svn.freebase-site.googlecode.dev/user.mf.js"><\/script>',""],debug_locs:[1,1,1,1,1,1,6,6,7,8,9,10,11,12,13,15,15,15,15,15,
15,15,15,15,17,17,17,17,20,20,23,23,23,23,23,25,25,25,25,30,30,30,30,30,30,30,31,31,31,35,35,35,35,35,35,35,37,37,37,37,37,37,37,40,40,40,40,40,42,42,42,42,42,42,42,45,45,45,45,48,48,49,49,49,53,53,53,53,53,53,54,54,54,58,58,58,58,58,58,58,60,60,60,60,60,60,60,63,63,63,63,63,65,65,65,65,65,65,65,68,68,68,68,69,69,69,69,69,69,71,71,71,71,74,74,74,74,74,74,74,74,75,75,75,75],output_mode:"html"}}})})(window.freebase.acre,window.freebase.h);
