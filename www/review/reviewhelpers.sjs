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

var i18n = acre.require("lib/i18n/i18n.sjs");
var freebase = acre.require("lib/promise/apis.sjs").freebase;
var deferred = acre.require("lib/promise/apis.sjs").deferred;

// Returns promise with all flag info for a given mid
function flagInfoQuery(flag) {
    var query = { 
        "mid": flag, 
        "type": "/freebase/review_flag", 
        "kind": {
            "key": {
                "value":null,
                "namespace":"/freebase/flag_kind"
            },
            "limit": 1,
        },
        "creator": null, 
        "status": null,
        "item":[{ 
            "mid": null,
            "name": i18n.mql.query.name(),
            "optional":true             
        }],
        "judgments":[{
            "creator": {
                "id": null,                                        
            },
            "mid":null,
            "item": {
                "mid":null,
                "optional":true
            },        
            "vote": {
                "key": {
                    "value":null,
                    "namespace":"/freebase/flag_vote"
                },
                "limit": 1,
            },
            "timestamp":null,
            "flag": null,
            "optional":true
        }]                
    };    

    return freebase.mqlread(query).then(function(env) {
        return env.result;
    }); 
};

function escalateFlagToConflicting(flag) {
    var query = {
        "mid": flag,
        "type": "/freebase/review_flag",
        "status": {
            "type": "/freebase/flag_status",
            "key": {
                    "value": "conflicting",
                    "namespace":"/freebase/flag_status"
            },            
            "connect": "update"
        }
    };
    return freebase.mqlwrite(query).then(function(env){
        return env.result;
    });
}

// Returns promise with data containing which usergroups a user is a part of
function usergroupQuery(user) {
    var query = {
        "id": user, 
        "mid": null, 
        "type": "/type/user",
        "usergroup" : []        
    };
    return freebase.mqlread(query).then(function(env) {
        return env.result;
    }); 
}

// Returns promise with results of casting a vote
function createVoteQuery(flag, vote, item) {
    var voteQuery = {
        "type":"/freebase/flag_judgment",
        "vote":{
            "type":"/freebase/flag_vote",
            "key": {
                    "value": vote,
                    "namespace":"/freebase/flag_vote"
            },
            "connect": "update"
        },        
        "flag":{
            "mid":flag,
            "connect":"update"
        },    
        "create":"unconditional"
    };
    if(item) {
        var mergePatch = { "item":{ "mid": item, "connect":"update" }    };
        acre.freebase.extend_query(voteQuery, mergePatch);
    }
    return freebase.mqlwrite(voteQuery).then(function(env) {
        return env.result;
    }); 
}

// Returns promise with results of deleting a vote
function deleteVoteQuery(voteid, flag, vote, item) {
    var deleteQuery = {             
        "mid": voteid,
        "type": "/freebase/flag_judgment",            
        "flag": {
            "type":"/freebase/review_flag",
            "mid": flag,
            "connect":"delete"
        },                
        "vote": {
            "type":"/freebase/flag_vote",
            "key": {
                    "value": vote,
                    "namespace":"/freebase/flag_vote"
            },
            "connect": "delete"
        }
    };    
    if(item) {
        var itempatch = { "item": { "mid": item, "connect": "delete" } };
        acre.freebase.extend_query(deleteQuery, itempatch);
    }    
    return freebase.mqlwrite(deleteQuery).then(function(env) {
        return env.result;
    }); 
}

// Returns promise with data of all links of an object
function linksForDeleteQuery(mid) {
    var readLinks =  [{
        "master_property": null,
        "source": {
            "mid": mid
        },
        "target": {
            "mid": null, 
            "guid": null, 
            "optional": true
        },
        "target_value": {},
        "type": "/type/link",
        "limit":10000
    }];
    return freebase.mqlread(readLinks).then(function(env) {
        return env.result;
    }); 
};

function validFlag(flagInfo) {
    var malformed = true;
    if(flagInfo.item && flagInfo.kind) {
        if(flagInfo.kind.key.value === "split" && flagInfo.item.length === 1) {
            malformed = false;
        } else if(flagInfo.kind.key.value === "delete" && flagInfo.item.length === 1) {
            malformed = false;
        } else if(flagInfo.kind.key.value === "merge" && flagInfo.item.length === 2) {
            malformed = false;
        } else if(flagInfo.kind.key.value === "offensive" && flagInfo.item.length === 1) {
            malformed = false;
        }     
    }
    return !malformed;
}   


// Returns promise for results of completely unlinking a object
function deleteEntity(mid) {

    return linksForDeleteQuery(mid).then(function(data) {

        if(!data) {
            return deferred.resolved("No links for MID " + mid + " found.");
        }

        var links = data;
        var promise = null;
        var deleteQuery = { "mid": mid };        

        for(var i = 0, l = links.length; i < l; i++) {
            var link = links[i];
            var prop = link.master_property;             
    
            if( prop == "/type/object/permission") {
                continue;
            }
            prop = "prop" + i + ":" + prop;
    
            if(link.target_value != null) {                                
                deleteQuery[prop] = link.target_value;
                deleteQuery[prop]["connect"] = "delete";
            } else {
                deleteQuery[prop] = {
                    "guid": link.target.guid,
                    "connect": "delete"
                };
            }        
        }

        return freebase.mqlwrite(deleteQuery);

    }, function(error) {
        return deferred.resolved("Read links error: " + error);
    });
}

// Returns promise of deleting a flag
function deleteFlag(mid) {

    var result = flagInfoQuery(mid).then(function(flagInfo) {
      
        if(!flagInfo) {
            return deferred.resolved("No flag info found for " + mid);
        } 
 
        var promise = null;      
        if(flagInfo.judgments) {  
            flagInfo.judgments.forEach(function(judgment){
                promise = deleteEntity(judgment.mid);
            });                               
        }
        if(!promise) {
            return deferred.resolve("No votes to delete.");
        } else {
            return promise;        
        }
    }, function(error) {       
        return deferred.rejected("Error reading flag for delete: " + error);
    });

    return result.then(function(data) {       
        return deleteEntity(mid);        
    });

}


