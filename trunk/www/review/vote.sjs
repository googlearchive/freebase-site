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
var i18n = acre.require("lib/i18n/i18n.sjs");
var _ = i18n.gettext;

var success        = _("Vote recorded.");
var missingParams  = _("Missing parameters.");
var invalidUser	   = _("Invalid user parameter.");
var invalidVote    = _("Invalid vote.");
var invalidFlag    = _("MID did not match a flag.");
var invalidItem    = _("Item supplied is not an option for flag.");
var malformedFlag  = _("Malformed flag.");
var lowPermission  = _("User does not have permission.");

var errorDeletingOldVotes = _("Error deleting old votes: ");
var errorWritingNewVote = _("Error writing new vote: ");

function processVote(flag, vote, item, user) {
    
    var flagInfo;
    var userInfo;    

    if(!user || !vote || !flag) {
        return deferred.rejected(missingParams);
    }
    if(vote !== "AGREE" && vote !== "DISAGREE" && vote !== "SKIP"){
        return deferred.rejected(invalidVote);
    }

    var flagPromise = reviewHelpers.flagInfoQuery(flag).then(function(result) {
        flagInfo = result;
        return deferred.resolved("");		
    }); 

    var userPromise = reviewHelpers.usergroupQuery(user.id).then(function(result) {              
        userInfo = result;                 
        return deferred.resolved("");
    });

    return deferred.all([flagPromise, userPromise]).then(function(result) {
        
        // Validate the flag
        if(!flagInfo) {		
            return deferred.rejected(invalidFlag);
        } else if(!reviewHelpers.validFlag(flagInfo)) {			
            reviewHelpers.deleteFlag(flag);
            return deferred.rejected(malformedFlag);
        } 

        // Authenitcate user if neccesary
        if(flagInfo.status) {		
            var authenticated = false;
            for(var i = 0; i < userInfo.usergroup.length; i++) {
	            var group = userInfo.usergroup[i];
                if( group === "/pipeline/admin" || group === "/freebase/badges/freebaseexpert") {
                    authenticated = true;
                    break;
                }			
            }
            if(!authenticated) {				
                return deferred.rejected(lowPermission);
            }
        }        

        // Authenticate item if neccesary
        if(flagInfo.kind === "Merge" && vote === "AGREE") {	
            if(!item) {				
                return deferred.rejected(missingParams);
            } else if(flagInfo.item[0].mid !== item && flagInfo.item[1].mid !== item ) {				
                return deferred.rejected(invalidItem);
            }				
        }

        // Remove any previous votes if found
        var promise = null;	
        if(flagInfo.judgments) {
            for(var i = 0; i < flagInfo.judgments.length; i++) {
                var judgment = flagInfo.judgments[i];		
                if(judgment.creator.id == user.id) {
                    var judgmentItem = (judgment.item) ? judgment.item.mid : null;	
                    promise = reviewHelpers.deleteVoteQuery(judgment.mid, flag, judgment.vote.name, judgmentItem);                    				
                }
            }	    
        }
        if(!promise) {
            return deferred.resolved("empty promise to contine");
        } else {
            return promise;
        }

        }).then(function(result) {
            // Write our new vote
            if(vote !== "AGREE" || flagInfo.kind !== "Merge") {
                item = null;
            }
            return reviewHelpers.createVoteQuery(flag, vote, item);
        }).then(function(result){
            return deferred.resolved(success);	
        });
}

var insufficientVotes = _("Insufficient votes to process");
var conflictingVotes  = _("Conflicting votes. Escalated to admin queue.");
var errorEscalating   = _("Error escalating flag: ");
var consensusOfVotes  = _("Consensus reached. Action being performed.");

function processFlag(flag) {

    return result = reviewHelpers.flagInfoQuery(flag).then(function(result) {
        
        var flagInfo = result; 

        if(!flagInfo) {            
            errorMsg = invalidFlag;
            return deferred.resolved(errorMsg);
        } else if(!reviewHelpers.validFlag(flagInfo)) {
            errorMsg = malformedFlag;
            return reviewHelpers.deleteFlag(flag);
        }

        // Sort judgments by creator and then by timestamp
        var judgments = flagInfo.judgments;
        judgments.sort(function(vote1, vote2) {  
            if(vote1.creator.id === vote2.creator.id) {                     
                return (vote1.timestamp > vote2.timestamp) ? 1 : -1;
            } else {                       
                return (vote1.creator.id > vote2.creator.id) ? 1 : -1;
            }
        });

        // Get a copy of only the most recent valid vote from each user
        var verifiedJudgments = [];
        for(var i = 0; i < judgments.length - 1; i++) {
            if(judgments[i].creator.id === flagInfo.creator.id) {
                reviewHelpers.deleteEntity(judgments[i].mid); 
            } else {
                if(judgments[i].creator.id == judgments[i+1].creator.id) {
                    reviewHelpers.deleteEntity(judgments[i].mid);                
                } else {
                    if(judgments[i].vote.name != "Skip") {
                        verifiedJudgments.push(judgments[i]);
                    }
                }
            }
        }
        if(judgments[judgments.length-1].creator.id === flagInfo.creator.id) {
            reviewHelpers.deleteEntity(judgments[judgments.length-1].mid);
        } else {
            if(judgments[judgments.length-1].vote.name!= "Skip") {
                verifiedJudgments.push(judgments[judgments.length-1]);  
            } 
        }        

        // Check and tally the votes
        if(verifiedJudgments.length < 3) {
            return deferred.resolved(insufficientVotes);
        }
        
        var votesFor1 = 0;
        var votesFor2 = 0;
        var votesFor = 0;
        var votesAgainst = 0; 
        for(var i = 0; i < verifiedJudgments.length; i++) {
            judgment = verifiedJudgments[i];
            if(judgment.item && judgment.item.mid === flagInfo.item[0].mid) votesFor1++;
            else if(judgment.item && judgment.item.mid === flagInfo.item[1].mid) votesFor2++;
            else if(judgment.vote.name === "Agree") votesFor++;
            else if(judgment.vote.name === "Disagree") votesAgainst++;
        }

        var voteDirections = 0;
        if(votesFor1) voteDirections++;  
        if(votesFor2) voteDirections++;
        if(votesFor) voteDirections++;
        if(votesAgainst) voteDirections++;
       
        if(voteDirections > 1) {
            // Conflicting votes, update flag with admin status
            return reviewHelpers.escalateFlagToConflicting(flag).then(function(env) {
                return deferred.resolved(conflictingVotes);
            }, function(env) {
                return deferred.resolved(errorEscalating + env.result);
            });
        } else {
    
            // DO FREEQ STUFF HERE
            return deferred.resolved(consensusOfVotes); 
          
        } 
    });
}
