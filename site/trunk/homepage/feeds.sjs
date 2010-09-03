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

