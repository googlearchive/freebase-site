var mf = acre.require("MANIFEST").MF;

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
      "name" : "Querying & Data",
      "docs" : [
        {
          "name"     : "Guides",
          "key"      : "data",
          "sections" : url_for("datadocs", "sections_getting_started" )
        },
        {
          "name"     : "MQL Cheatsheet",
          "key"      : "mql_cheatsheet",
          "link"     : mf.urls.cheatsheet
        },
        {
          "name"     : "MQL Reference",
          "key"      : "mql",
          "sections" : url_for("mql","sections_new?base="+ acre.request.base_path) // XXX: what is base_path used for?
        },
        {
          "name"     : "Query Recipes",
          "key"      : "mql_recipes",
          "link"     : mf.urls.query_recipes
        },
        /* Removed (and broken)
        {
          "name"     : "Query Troubleshooting",
          "key"      : "query_troubleshooting",
          "content"  : url_for("datadocs", "embed/query_troubleshooting")
        },
        */
        {
          "name"     : "Data Dumps",
          "key"      : "data_dumps",
          "link"  : mf.urls.data_dumps
        }
      ]
    },
    {
      "name" : "APIs & Libraries",
      "docs" : [
        {
          "name"     : "Web Services",
          "key"      : "web_services",
          "sections" : url_for("devdocs","web_services_list")
        },
        {
          "name"     : "Language Libraries",
          "key"      : "client_libraries",
          "link"     : mf.urls.client_libraries
        },
        {
          "name"     : "Freebase Suggest",
          "key"      : "suggest",
          "content"  : mf.require('template','MANIFEST').MF.suggest.base_url + "/index.html"
        }
      ]
    },
    {
      "name" : "Acre",
      "docs" : [
        {
          "name"     : "Guides",
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
          "sections" : url_for("jscheatsheet", "sections")
        },
        {
          "name"     : "Acre Recipes",
          "key"      : "acre_recipes",
          "link"     : mf.urls.acre_recipes
        },
        {
          "name"     : "Acre Wiki",
          "key"      : "acre_wiki",
          "link"     : mf.urls.acre_wiki
        }
      ]
    },
    {
      "name" : "Labs (Experimental)",
      "docs" : [
        {
          "name": "Topic API",
          "key": "topic_api",
          "sections": url_for("libtopic", "doc_sections")
        },
        {
          "name"     : "MQL Extensions",
          "key"      : "mql_extensions",
          "sections" : url_for("devdocs","mql_extensions_list")
        },
        {
          "name": "Geosearch",
          "key": "geosearch",
          "content": acre.freebase.service_url + "/api/service/geosearch?help"
        },
        {
          "name": "Code Search",
          "key": "codesearch",
          "content": acre.freebase.service_url + "/api/service/codesearch?help"
        }
      ]
    }
  ];
}

if (acre.current_script == acre.request.script) {
    acre.write(JSON.stringify(get_list(), null, 2));
}
