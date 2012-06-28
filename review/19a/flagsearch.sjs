/*
 * Copyright 2012, Google Inc.
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

var reviewHelpers = acre.require("reviewhelpers.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;

function findFlags(user, limit, voted, created, order, kind, domain, admin, cursor) {
        
    var baseQuery = [{ 
        "mid":null,  
        "type":"/freebase/review_flag", 
        "item":[{ 
            "mid":null, 
        }] 
    }];
          
    // Show flags that need admin review?
    var showAdmin = null;
    if(admin) {       
        if(admin === "adminonly") {
            showAdmin = "required";
        } else if(admin === "nonadmin") {
            showAdmin = "forbidden";
        } else if(admin === "both") {
            showAdmin = null;
        } else {
            showAdmin = "forbidden";
        }               
    } 
    if(showAdmin) {
        var adminPatch = { "status": { "mid": null, "optional": showAdmin } };
        baseQuery = acre.freebase.extend_query(baseQuery, adminPatch);
    }
           
    if(kind) {        
        if(kind === "merge" || kind === "split" || kind === "delete" || kind === "offensive" ) {
            var kindPatch = { 
                "kind": {
                    "key": {
                        "value": kind,
                        "namespace":"/freebase/flag_kind"
                     },
                }
            };
            baseQuery = acre.freebase.extend_query(baseQuery, kindPatch);
        }
    }

    // Deciding whether or not to show flags we've voted on.
    var showVotedOn = null;
    if(voted) {
        if(voted === "notvotedon") {
            showVotedOn = "forbidden";       
        } else if(voted === "votedon") {
            showVotedOn = "required";            
        } else {
            showVotedOn = null;
        }
    }
    if(showVotedOn) {        
        var votedPatch = {
            "legacy:judgments": [{
                "creator": {"id": user.id},
                "optional": showVotedOn
            }]                
        }                
        baseQuery = acre.freebase.extend_query(baseQuery, votedPatch);
    } 

    // Deciding whether or not to show flags we've created.
    var showCreated = null;
    if(created){
        if(created === "notcreated") {
            showCreated = "forbidden";
        } else if(created === "created") {
            showCreated = "required";
        } else {
            showCreated = null;
        }
    }
    if(showCreated) {
        var createdPatch = {                
            "legacy:creator": {
                "id": user.id,
                "optional": showCreated
            }
        }            
        baseQuery = acre.freebase.extend_query(baseQuery, createdPatch);
    }

    if(limit && limit > 0) {
        var limitPatch = {"limit": limit};
        baseQuery = acre.freebase.extend_query(baseQuery, limitPatch);
    } 

    if(domain) {
        var domainPatch = { 
            "item": [{ 
                "type": [{ 
                    "domain": domain
                }]
            }]
        };
        baseQuery = acre.freebase.extend_query(baseQuery, domainPatch);
    } 
    
    var sorting = {
        "timeasc" : {"timestamp":null, "sort":"timestamp" },
        "timedes" : {"timestamp":null, "sort":"-timestamp" },
        "voteasc" : {
            "num:judgments": {"return": "count", "optional": true}, 
            "sort": "num:judgments.count"
        },
        "votedes" : { 
            "num:judgments": {"return": "count", "optional": true}, 
            "sort": "-num:judgments.count"
        }
    };
    if(sorting[order]){
        acre.freebase.extend_query(baseQuery, sorting[order]);    
    }             

    if(!cursor) {
        cursor = true;       
    }
    return freebase.mqlread(baseQuery, {"cursor": cursor}); 

}




