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