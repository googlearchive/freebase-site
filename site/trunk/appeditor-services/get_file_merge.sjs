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

var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

var lib_p       = acre.require("lib_diff_match_patch");
var lib_patch   = new lib_p.diff_match_patch;
var lib_file     = acre.require("get_file");
var lib_content = acre.require('get_file_revision');


function find_common_revision(fileid1, fileid2) {
    var q = {
      "id": null,
      "type": "/type/content",
      "sort" : "-a:/type/reflect/any_reverse.link.timestamp",
      "limit" : 1,
      "a:/type/reflect/any_reverse": [{
        "link": {
          "source": {
            "id": fileid1
          },
          "timestamp": null,
          "valid": null,
          "master_property": "/common/document/content"
        }
      }],
      "b:/type/reflect/any_reverse": [{
        "link": {
          "source": {
            "id": fileid2
          },
          "timestamp": null,
          "valid": null,
          "master_property": "/common/document/content"
        }
      }]
    };
    var result = FB.mqlread(q).result;
    return result ? result.id : null;
}


function merge_files(sourceid, targetid) {
    
    var source  = lib_file.get_file(sourceid);
    var target  = lib_file.get_file(targetid);
        
    var ret = {
        file1 : source,
        file2 : target
    };
        
    
    /*
    *  Easy cases first:
    */

    // neither file exists
    if (!source && !target) {
        _throw_patch_conflict("Neither source nor target file exists");
    }

    // source doesn't exist - delete the file
    if (!source) {
        if (target.text) {
            ret.diff = lib_patch.diff_lines(target.text, "");
        }
        delete target.text;
        return ret;
    }

    // target doesn't exist - create the file
    if (!target) {
        if (source.text) {
            ret.diff = lib_patch.diff_lines("", source.text);
        }
        return ret;
    }
    
    // We can't merge binary files
    if (source.binary && target.binary) {
        return ret;
    }

    // Yikes.  Even worse.
    if (source.binary || target.binary) {
        _throw_patch_conflict("Can't merge text and binary");
    }
    
    
    /*
     *  Both files exist, let's compare revisions
     */
     
    function check_metadata_change(message){
        var metadata_change = false;
        if (source.name !== target.name) { metadata_change = true; }
        if (source.acre_handler !== target.acre_handler) { metadata_change = true; }
        if (source.content_type !== target.content_type) { metadata_change = true; }
        
        if (metadata_change) {
            ret.message = message;
            return ret;
        } else {
            _throw_patch_conflict(message);
        }
    }
     
    // no change in content        
    if (source.revision === target.revision) {
        return check_metadata_change("No content changes")
    }
    
    // check for common ancestor revision between the files
    var ancestor_rev = find_common_revision(sourceid, targetid);
    
    // no new changes, so don't provide diff
    if (ancestor_rev === source.revision) {
        // make sure the revert doesn't happen client-side
        delete source.revision
        return check_metadata_change("This is an older version of the same file.");
    }
    
    // it's a simple, fast-forward merge
    if (ancestor_rev === target.revision) {
        ret.diff = lib_patch.diff_lines(target.text, source.text);
        return ret;
    }
    
    
    /*
     *  OK, time to do a real merge
     */
    
    var ancestor = lib_content.get_file_revision(null, ancestor_rev);
    if (!ancestor) {
        _throw_patch_conflict("Source and target files do not share a common ancestor.");
    }
    
    // diff the source and the ancestor and apply the patch to the target
    var patch = lib_patch.patch_make(ancestor.text, source.text);
    var result = lib_patch.patch_apply(patch, target.text);
    var conflict_text = "";
    
    ret.patch = {
        text : result[0],
        conflict : false
    };
        
    for (var p in patch) {
        if (!result[1][p]) {
            var conflict = patch[p];

            var str = "\n@@";
            str += " -" + conflict.start1 + "," + conflict.length1;
            str += " +" + conflict.start2 + "," + conflict.length2;
            str += " @@";
            str += "\n*-------- DELETE --------*\n";
            str += _encode_patch_text(lib_patch.diff_text1(conflict.diffs));
            str += "\n*-------- INSERT --------*\n";
            str += _encode_patch_text(lib_patch.diff_text2(conflict.diffs));
            str += "\n";
            
            conflict_text += str;    
            ret.patch.conflict = true;
        }
    }

    if (conflict_text.length) {
        ret.patch.text = 
            "*------- CONFLICTS ------*\n" + 
            conflict_text + 
            "*----- END CONFLICTS ----*\n\n\n" + 
            ret.patch.text;
    }
    
    ret.diff = lib_patch.diff_lines(target.text, ret.patch.text);    
    
    delete source.text;
    delete target.text;
    return ret;

    function _encode_patch_text(text) {
        // return encodeURI(text).replace(/\x0/g, '%00').replace(/%20/g, ' ');
        return text;
    }
    
    function _throw_patch_conflict(msg, info) {
        var error = new service.ServiceError("400 Bad Request", null, {
            message : msg,
            code    : "/api/status/error/merge/conflict"
        });
        
        error.messages[0].info = info || {
            source   : source,
            target   : target,
            ancestor : ancestor
        };
        
        throw error;
    }
};


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args();
            
        return merge_files(args.fileid1, args.fileid2);
    }, this);
}