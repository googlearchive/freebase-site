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
 */

var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;


////////////////////////
// Wrap xml dom in JS //
////////////////////////

var xml = (function() {
  var dom;
  
  function textInTag(parent,tag) {
    try {
      return parent.getElementsByTagName(tag)[0].childNodes[0].nodeValue;
    } catch (e) {
      console.warn('XML: '+e);
      return null;
    }
  }

  return {
    // setup a dom
    parse   : function(source) { dom = acre.xml.parse(source); },
    
    // return JS array of all elements of tagname
    getTags : function(tagname) {
      var nodelist = dom.getElementsByTagName(tagname);
      return Array.prototype.slice.apply(nodelist);
    },
    
    // return JS obj of all nodeValues of specified tags
    getValues : function(item,tags) {
      var obj = {};
      tags.forEach(function(tag) {
        obj[tag] = textInTag(item,tag);
      });
      return obj;
    }
  };
})();


//////////////////
// RSS Handling //
//////////////////
function get_rss_entries(url,maxcount,filterFunc) {
  var items;
  return urlfetch(url).then(function(r) {
    try {
      var rss = r.body;
      xml.parse(rss);
      items = xml.getTags('item').map(function(item) {
        return xml.getValues( item, ['title','dc:creator','pubDate','description','link'] );
      });
    } catch(e) {console.warn('RSS Exception: '+e); }
    if (!(items && items.length)) { console.warn('Could not parse any items from '+url,rss); }

    if (filterFunc) { items = filterFunc(items); }
    if (maxcount)   { items = items.slice(0,maxcount); }

    return items;
  });
}

function filter_wiki_entries(items) {
  var seen = {};
  items = items.filter(function(item) {
    // avoid dups
    if (item.title in seen) { return false; }
    seen[item.title]=true;

    // ignore boring namespaces
    if (/^(User|File):/.test(item.title)) { return false; }

    return true;
  });
  return items;
}

