// Simple MANIFEST-based proxy
// Example: 
//    <app host>/proxy/freebase/site/domain/index?id=/base/cannes

var mf = acre.require("MANIFEST").MF
var router = acre.require("extension_router");

var req = acre.request;
var path_segs = req.path_info.split("/");

var appid, filename, path_info;
for (var i=2; i < path_segs.length; i+=1) {
    
    // look for shortest appid match in MANIFEST
    for (var key in mf.version) {
        var temp_appid = path_segs.slice(0,i).join("/");
        if  (key === temp_appid) {
            appid = temp_appid;
            break;
        }
    }
    
    // found one; set-up route and route to it
    if (appid) {
        filename = path_segs[i];
        path_info = "/" + path_segs.slice(i+1).join("/");
        var scriptid = appid + "/" + filename;
        router.do_route(req, scriptid, mf.version[appid], path_info);
        break;
    }
    
    // No match; TODO: route to where?
    // router.do_route(req, scriptid, mf.version[appid], path_info);
}