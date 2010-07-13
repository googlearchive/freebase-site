// add headers to acre.urlfetch that affect caching

function acre_get(url) {
  
  var headers = {};
  
  ['pragma', 'cache-control', 'cookie'].forEach(function(h) {
    if (h in acre.request.headers) {
      headers[h] = acre.request.headers[h];
    }
  });
  
  return acre.urlfetch(url, "GET", headers);
}


function get_content(url, query) {
  try {
    if (typeof query != undefined && query && query.length > 0) {
      if (url.indexOf("?") > -1) {
        url = url.split("?")[0];
      }
      url += "?" + query;
    }
    
    var result = acre_get(url);
    var text = result.body;
    var content_type = result.headers['content-type'].split(';')[0];
    if (content_type == 'text/plain') {
      text = "&lt;pre&gt;" + text + "&lt;/pre&gt;";
    } else {
      var match = /\x3cbody(?:\s+[^\x3e]*)?\x3e([\s\S]*)\x3c\x2fbody\x3e/im.exec(text);
      if (match) { text = match[1]; }
                          }                     
    } catch(e) {
      text = "&lt;pre&gt;" + acre.html.encode(JSON.stringify(e.response || e, null, 2)) + "&lt;/pre&gt;";
    }
    return text;
}


// generate the host of this app for re-entrant urlfetches
function get_doc_host() {
  var host = "http://docs." + acre.host.name;
  
  var appid = acre.current_script.app.id;
  var version;
  if (acre.current_script.app.version) { version = acre.current_script.app.version; }
  var dev_url = acre.make_dev_url(appid, version);
  
  if (dev_url +  '/' == acre.request.base_url) {
    host = dev_url;
  }
  
  return host;
}
    
    
function setup(path_info) {
  var categories = acre.require("doc_list").get_list();

  var request = acre.request;
  var query = request.query_string;
  // This is not used. Calling get_user_info makes pages that use this NOT cacheable
  //var user = acre.freebase.get_user_info();
  var sel_category;
  var sel_section;
  var path = path_info.split('/');
  // ignore leading /
  sel_category = path[1];
  sel_section  = path[2];

  sel_category = sel_category || categories[0].docs[0].key;
  
  var section_url;
  var doc_link;
  var doc_content;
  
  var header = "Developer Documentation";
  var title = "";

  for each (var category in categories) {
    for each (var doc in category.docs) {
      if (sel_category == doc.key) {
        if (doc.link) {
          acre.response.status = 301;
          acre.response.set_header("location", doc.link);
          acre.exit();
        }
        section_url = doc.sections || '';
        
        doc_link = doc.link;
        doc_content = doc.content;
        title += doc.name;
        

        if (section_url) {
          var feed = JSON.parse(acre_get(section_url).body);
          var sections = feed.contents;
          var sel_section = sel_section || (sections ? ("defaultSection" in feed ? sections[feed.defaultSection].key : sections[0].key) : null);
          for each (var section in sections) {
            if (sel_section == section.key) {
              title += " - " + section.name;
            }
          }
        }
      }        
    }
  }

  if (title == "") {
    title = header;
  }
  
  var o = {
    header : header,
    title : title,
    categories : categories,
    //user : user,
    sections : sections,
    section_url : section_url,
    sel_category : sel_category,
    sel_section : sel_section,
    doc_link : doc_link,
    doc_content : doc_content,
    query : query
  };
  
  return o;
};

  
