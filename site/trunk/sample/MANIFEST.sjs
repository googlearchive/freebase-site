
var MF = {

    version: {
        "/freebase/site/core": null
    },

    stylesheet: {
        "sample_page.css": ["/freebase/site/core/core.css", "sample_page.css", "sample_page.less"]
    },

    javascript: {
        "sample_page.js": ["/freebase/site/core/core.js", "sample_page.js"]
    }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).extend_manifest(MF, this);
if (acre.current_script == acre.request.script) {
    MF.main();
};
