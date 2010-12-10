var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

var lib_p       = acre.require("lib_diff_match_patch");
var lib_patch   = new lib_p.diff_match_patch;
var lib_file     = acre.require("get_file");


function diff_file(fileid1, fileid2, timestamp1, timestamp2) {
    var ret = {
        file1 : null,
        file2 : null
    };
    
    try {
        ret.file1 = lib_file.get_file(fileid1, timestamp1);
    } catch (e) {}
    
    try {
        ret.file2 = lib_file.get_file(fileid2, timestamp2);
    } catch (e) {}
    
    // If no files, don't do a diff
    if (!ret.file1 && !ret.file2) {
        return ret;
    }
    
    // If any files are binary, don't do a diff
    if ((ret.file1 && ret.file1.binary) || (ret.file2 && ret.file2.binary)) {
        return ret
    }
    
    // If the files haven't changed, don't do a diff
    if (ret.file1 && ret.file2 && (ret.file1.revision === ret.file2.revision)) {
        return ret;
    }
    
    var text1 = ret.file1 && ret.file1.text ? ret.file1.text : "";
    var text2 = ret.file2 && ret.file2.text ? ret.file2.text : "";

    ret.diff = lib_patch.diff_lines(text2,text1);
        
    return ret;
};


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args();
            
        return diff_file(args.fileid1, args.fileid2, args.timestamp1, args.timestamp2);
    }, this);
}