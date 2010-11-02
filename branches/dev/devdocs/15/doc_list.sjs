var mf = acre.require("MANIFEST").mf;
var util = acre.require("util");
var host = util.get_doc_host();

// could not use h.url_for because it requires the app to in core/MANIFEST, not the local manifest
// var h = mf.require("core", "helpers");

function url_for(app,file) {
  if (!(app in mf.apps)) { console.error('Could not find '+app+' in mf.apps:',mf.apps); return null; }
  var url = acre.host.protocol + ":" + mf.apps[app] + "." + acre.host.name + 
            (acre.host.port !== 80 ? (":" + acre.host.port) : "") + (file ? "/" + file : "");
  return url;
}

function get_list() {
  return [
    {
      "name" : "APIs",
      "docs" : [
        {
          "name"     : "Freebase Overview",
          "key"      : "data",
          "sections" : url_for("datadocs", "sections_getting_started" )
        },
        {
          "name"     : "MQL Reference",
          "key"      : "mql",
          "sections" : url_for("mql","sections_new?base="+ acre.request.base_path) // XXX: what is base_path used for?
        },
        {
          "name"     : "MQL Read",
          "key"      : "mqlread",
          "content": host + "/web_service/en/api_service_mqlread"
        },
        {
          "name"     : "MQL Write",
          "key"      : "mqlwrite",
          "content"  : host + "/web_service/en/api_service_mqlwrite"
        },
        {
          "name"     : "MQL Extensions",
          "key"      : "mql_extensions",
          "sections" : url_for("devdocs","mql_extensions_list")
        },
        {
          "name"     : "Topic API",
          "key"      : "topic_api",
          "sections" : url_for("libtopic", "doc_sections")
        },
        {
          "name"     : "All Web Service APIs",
          "key"      : "web_services",
          "sections" : url_for("devdocs","web_services_list")
        }
      ]
    },
    {
      "name" : "Widgets",
      "docs" : [
        {
          "name"     : "Freebase Suggest",
          "key"      : "suggest",
          "content"  : mf.lib_base_url('suggest') + "/index.html"
        }
      ]
    },
    {
      "name" : "Acre",
      "docs" : [
        {
          "name"     : "Acre Overview",
          "key"      : "acre",
          "sections" : url_for("acredocs", "sections")
        },
        {
          "name"     : "Template Reference",
          "key"      : "acre_templates",
          "sections" : url_for("mjt", "sections")
        },
        {
          "name"     : "API Reference",
          "key"      : "acre_api",
          "sections" : url_for("acreassist", "sections")
        },
        {
          "name"     : "Javascript Reference",
          "key"      : "js_reference",
          "sections" : url_for("jscheatsheet", "sections"),
          "hidden"   : true // only show if requested directly (by app editor)
        }
      ]
    }
  ];
}

if (acre.current_script == acre.request.script) {
    acre.write(JSON.stringify(get_list(), null, 2));
}
