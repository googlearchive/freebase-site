var mf = acre.require("MANIFEST").MF;
var g = acre.require("/freebase/apps/global/templates", mf.version["/freebase/apps/global"]).g;

function get_list() {
  return [
    {
      "name" : "Querying & Data",
      "docs" : [
        {
          "name"     : "Guides",
          "key"      : "data",
          "sections" : g.lib.app_url("/user/dfhuynh/datadocs", mf.version["/user/dfhuynh/datadocs"]) + "/sections_getting_started" 
        },
        {
          "name"     : "MQL Cheatsheet",
          "key"      : "mql_cheatsheet",
          "link"     : mf.urls.cheatsheet
        },
        {
          "name"     : "MQL Reference",
          "key"      : "mql",
          "sections" : g.lib.app_url("/user/jdouglas/mql", mf.version["/user/jdouglas/mql"]) + "/sections_new?base="+g.bp
        },      
        {
          "name"     : "Query Recipes",
          "key"      : "mql_recipes",
          "link"     : mf.urls.query_recipes
        },
        {
          "name"     : "Query Troubleshooting",
          "key"      : "query_troubleshooting",
          "content"  : g.lib.app_url("/user/dfhuynh/datadocs", mf.version["/user/dfhuynh/datadocs"]) + "/embed/query_troubleshooting"
        },
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
          "sections" : g.lib.app_url(acre.current_script.app.id, acre.current_script.app.version) + "/web_services_list"
        },
        {
          "name"     : "Language Libraries",
          "key"      : "client_libraries",
          "link"     : mf.urls.client_libraries
        },
        {
          "name"     : "Freebase Suggest",
          "key"      : "suggest",
          "content"  : g.suggest_base + "/index.html"
        }  
      ]
    },
    {
      "name" : "Acre",
      "docs" : [
        {
          "name"     : "Guides",
          "key"      : "acre",
          "sections" : g.lib.app_url("/user/stefanomazzocchi/acredocs", mf.version["/user/stefanomazzocchi/acredocs"]) + "/sections"
        },
        {
          "name"     : "Template Reference",
          "key"      : "acre_templates",
          "sections" : g.lib.app_url("/user/jdouglas/templates", mf.version["/user/jdouglas/templates"]) + "/sections"
        },
        {
          "name"     : "API Reference",
          "key"      : "acre_api",
          "sections" : g.lib.app_url("/user/dfhuynh/acreassist", mf.version["/user/dfhuynh/acreassist"]) + "/sections"
        },
        {
          "name"     : "Javascript Reference",
          "key"      : "js_reference",
          "sections" : g.lib.app_url("/user/stefanomazzocchi/jscheatsheet", mf.version["/user/stefanomazzocchi/jscheatsheet"]) + "/sections"
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
          "sections": g.lib.app_url("/user/fbclient/libtopic", mf.version["/user/fbclient/libtopic"]) + "/doc_sections"
        },
        {
          "name"     : "MQL Extensions",
          "key"      : "mql_extensions",
          "sections" : g.lib.app_url(acre.current_script.app.id, acre.current_script.app.version) + "/mql_extensions_list"
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
