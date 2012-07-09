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

(function($, fb, formlib) {

    var incomingContentHash = {};
    var loadedContentHash = {};
    var loadedFlagsArray = [];

    var flagSearchParams = {};
    var loadedFlagsCursor = null;    

    var currentFlag = 0;
    var preloadDirection = 1;

    var currentDiv = null;
    var divCounter = 0;

    var waitingOnContent = true;
    var waitingOnFlags = false;

    function IncomingContent(flag) {
        this.flag = flag;
    }    
    function LoadedContent(flag, html, loc) {
        this.flag = flag;
        this.html = html;
        this.location = loc;
    }
    function flagsReceived(response) {        

        loadedFlagsCursor = response.cursor;
        loadedFlagsArray = loadedFlagsArray.concat(response.flags);
        
        // Shouldn't need, but just in case
        var duplicateCheck = loadedFlagsArray.sort();
        for(var i = 0, l = duplicateCheck.length - 1; i < l; i++) {
            if(duplicateCheck[i] === duplicateCheck[i+1]) {
                loadedFlagsArray.splice(loadedFlagsArray.indexOf(duplicateCheck[i]), 1);
            }
        }

        if(response.cursor === false){           
            loadedFlagsArray.push(-1);            
        }
        if(waitingOnFlags) {
            waitingOnFlags = !waitingOnFlags;
            loadNextAvailable();
        }        
    }
    function contentReceived(flag, html) {        

        if(html === "invalid" || html === "notaflag") {
            incomingContentHash[flag] = null;                       
            loadedFlagsArray.splice(loadedFlagsArray.indexOf(flag), 1);
            return loadNextAvailable();
        }

        var incoming = incomingContentHash[flag];
        incomingContentHash[flag] = null;

        var newDiv = $(document.createElement('div'));
        var newId = "content" + divCounter++;
        newDiv.hide();        
        newDiv.attr("id", newId);
        newDiv.appendTo("#storage");
        newDiv.html(html);

        var loaded = new LoadedContent(flag, html, newId);
        loadedContentHash[flag] = loaded;

        if(waitingOnContent && loadedFlagsArray[currentFlag] === flag) {
            waitingOnContent = false;
            transitionToFlag(flag);           
            loadNextAvailable();
        }
    }
    
    function loadNextAvailable() { 

        var flagOfInterest = waitingOnContent ? currentFlag : currentFlag + preloadDirection;
        if(flagOfInterest < 0) {
            return;        
        }
        if(flagOfInterest >= loadedFlagsArray.length) {
            if(!waitingOnFlags) {
                waitingOnFlags = true;
                loadFlags();
            } 
        } else {            
            var mid = loadedFlagsArray[flagOfInterest];
            if(mid === -1) {                
                if(waitingOnContent) {
                    waitingOnContent = false;
                    removeButtonListeners();
                    transitionToComplete();
                }
            } else {                       
                if(loadedContentHash[mid]) {               
                    if(loadedContentHash[mid].location === null) {                     
                        var newDiv = $(document.createElement('div'));
                        var newId = "content" + flagOfInterest;
                        newDiv.hide();                    
                        newDiv.attr("id", newId);
                        newDiv.appendTo("#storage");
                        newDiv.html(loadedContentHash[mid].html);
                        loadedContentHash[mid].location = newId;
                    }
                    if(waitingOnContent) {                    
                        waitingOnContent = false;
                        transitionToFlag(mid);
                        loadNextAvailable();
                    }
                } else if(incomingContentHash[mid]) {                                                
                } else {                                             
                    loadContent(mid);
                }
            }
        }
    }
    function loadFlags() {    
        
        flagSearchParams.limit = 5;
        if(loadedFlagsCursor) {
            flagSearchParams.cursor = loadedFlagsCursor;
        }

        $.ajax($.extend(formlib._default_ajax_options("GET"), {                       
            url: fb.h.ajax_url("flagsearch.ajax"),
            data: flagSearchParams,
            dataType: "JSON",                        
            onsuccess: function(data) {                 
                flagsReceived(data.result);
            },
            onerror: function(error) {
               transitionToError(error);            
            }  
        }));        
    }
    function loadContent(mid) {

        var newIncoming = new IncomingContent(mid);
        incomingContentHash[mid] = newIncoming;

        $.ajax($.extend(formlib._default_ajax_options("GET"), {            
            dataType: "JSON",           
            url: fb.h.ajax_url("flagcontent.ajax"),
            data: { "flag": mid },           
            onsuccess: function(data) {
                contentReceived(mid, data.result.html);
            },
            onerror: function(error) {
                transitionToError(error);
            }
        }));
    }

    function transitionToError(msg) {
        fb.status.error(msg);
        $("#errormsg").html( $("#errormsg").html() + JSON.stringify(msg));
        transitionToDiv("errormsg");
    }
    function transitionToComplete() {
        fb.status.info("Complete"); // I think it would be better to show a div with links to other parts of the queue        
        transitionToDiv("complete");
    }
    function transitionToFlag(mid) {
        transitionToDiv(loadedContentHash[mid].location);
    }
    function transitionToDiv(div) {

        var inDiv  = $("#" + div);
        var outDiv = (currentDiv) ? $(currentDiv) : null;
            
        var width = $(window).width();
        var finalPosition = (preloadDirection === 1) ? width : -width;
        
        var animationsCompleted = 0;

        function transitionComplete() {

            currentDiv = inDiv;
            inDiv.removeAttr("style");
            
            if(outDiv) {
                outDiv.hide();
                outDiv.css({
                    "left": "",
                    "width": "",
                    "position": ""
                });                
            }

            if(currentFlag + 5 < loadedFlagsArray.length) {
                var highFlag = loadedFlagsArray[currentFlag+5];
                if(highFlag !== -1) {
                    if(loadedContentHash[highFlag]) {                   
                        $("#" + loadedContentHash[highFlag].location).remove();
                        loadedContentHash[highFlag].location = null;
                    }
                }
            }
            if(currentFlag >= 5) {
                var lowFlag = loadedFlagsArray[currentFlag-5];
                if(loadedContentHash[lowFlag]) {
                    $("#" + loadedContentHash[lowFlag].location).remove();
                    loadedContentHash[lowFlag].location = null;
                }
            }

            attachButtonListeners();
        }

        removeButtonListeners();

        inDiv.css({
            "position": "absolute",
            "left": finalPosition,
            "width": width
        });       
        inDiv.show();
        
        inDiv.animate({left: 0},{
            duration: "normal",
            complete: function() {                
                animationsCompleted++;                
                if(animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });

        if(outDiv) {
            outDiv.css("position", "absolute");
            outDiv.css("left", 0);
            outDiv.css("width", width);

            outDiv.animate({left: -finalPosition}, {
                duration: "normal",
                complete: function() {
                    animationsCompleted++;
                    if(animationsCompleted === 2) {
                        transitionComplete();
                    }
                }
            });
        } else {
            animationsCompleted++;
        }        
    }
    
    function openDiscuss() {

        var contentDiv = currentDiv.find("#flag-content");
        var discussDiv = currentDiv.find("#discuss-content");

        currentDiv.find(".toggle-discuss").find("button").attr("disabled", true);
        currentDiv.find(".toggle-discuss").find("button").off("click");

        var animationsCompleted = 0;
        function transitionComplete() {
            currentDiv.find(".toggle-discuss").find("button").removeAttr("disabled");           
            currentDiv.find(".toggle-discuss").find("button").click(function(){
                closeDiscuss();
                return false;
            });
        }
        
        // Sneak it down a little bit so transition goes smoothly
        
        contentDiv.animate({"width": "74%"},{
            duration: "normal",
            complete: function() {
                animationsCompleted++;
                if(animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });

        discussDiv.css("width", 0);
        discussDiv.toggle();
        discussDiv.animate({            
            "width": "25%"        
        },{
            duration: "normal",
            complete: function() {
                animationsCompleted++;
                if(animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });
    }   
    function closeDiscuss() {
        var contentDiv = currentDiv.find("#flag-content");
        var discussDiv = currentDiv.find("#discuss-content");
        
        currentDiv.find(".toggle-discuss").find("button").attr("disabled", true);
        currentDiv.find(".toggle-discuss").find("button").off("click");

        var animationsCompleted = 0;
        function transitionComplete() {          
            
            currentDiv.find(".toggle-discuss").find("button").removeAttr("disabled");     
            currentDiv.find(".toggle-discuss").find("button").click(function(){
                openDiscuss();
                return false;
            });
        }

        discussDiv.css("width", "24%");
        discussDiv.animate({            
            "width": 0
        },{
            duration: "normal",
            complete: function() {
                discussDiv.css("display", "none");
                animationsCompleted++;
                if(animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });

        contentDiv.animate({"width": "100%"},{
            duration: "normal",
            complete: function() {
                discussDiv.css("display", "none");
                animationsCompleted++;
                if(animationsCompleted === 2) {
                    transitionComplete();
                }
            }
        });        
    }
  
    
    function modalForm(obj) {
        var form_options = {          
            "form": obj, 
            "init": $.noop,
            "validate": function() {
                return true;            
            },
            "submit": $.noop
        };
        formlib.init_modal_form(form_options);
    }

    function attachButtonListeners() {        
       
        currentDiv.find(".toggle-share").find("button").click(function(){           
            currentDiv.find(".sharing-options").toggle();
            return false;
        });  
        currentDiv.find("#link-to-flag").click(function(){
            $("#queue-link-to-flag").find("#link-text").val($(this).attr("href"));            
            modalForm($("#queue-link-to-flag"));
            return false;
        });
        currentDiv.find("#add-link-to-list").click(function(){
            if($("#queue-link-list").val().indexOf($(this).attr("href")) === -1) {
                $("#queue-link-list").val( $("#queue-link-list").val() + $(this).attr("href") + ",");
            }            
            $(this).text("Added");
            $(this).off("click"); 
            return false;
        });
        currentDiv.find("#get-link-list").click(function(){
            if($("#queue-link-list").val().length > 1) {
                $("#queue-link-to-flag").find("#link-text").val($("#queue-link-list").val());            
                modalForm($("#queue-link-to-flag"));
            }
            return false;
        });                     
        currentDiv.find(".toggle-discuss").find("button").click(function(){           
            if(currentDiv.find("#discuss-content").width() > 0) { 
                closeDiscuss();
            } else {
                openDiscuss();
            }
            return false;
        });
        currentDiv.find(".vote-form").find("button").click(function(){            
            voteSubmit($(this).parent(".vote-form"));          
            forwardProgress();
            return false;                       
        });       
        currentDiv.find(":submit").removeAttr("disabled"); 

        if(currentFlag > 0 ) {                                             
            $(".queue-back-button").click(backwardProgress);
            $(".queue-back-button").removeAttr("disabled");
            $(".queue-back-button").show();          
        } else {
            $(".queue-back-button").off("click");
            $(".queue-back-button").attr("disabled", true);
            $(".queue-back-button").hide();
        }

        if(loadedFlagsArray.length - 1 > currentFlag) {
            $(".queue-forward-button").click(forwardProgress);           
            $(".queue-forward-button").removeAttr("disabled");
            $(".queue-forward-button").show(); 
        } else {
            $(".queue-forward-button").off("click");
            $(".queue-forward-button").attr("disabled", true);
            $(".queue-forward-button").hide();
        } 
    }
    function removeButtonListeners() {        
        if(currentDiv) {            
            currentDiv.find(":submit").attr("disabled", true);  
            currentDiv.find(".vote-form").find("button").off("click");
            
            currentDiv.find("#link-to-flag").off("click");
            currentDiv.find("#add-link-to-list").off("click");
            currentDiv.find("#get-link-list").off("click");            

            currentDiv.find(".toggle-discuss").find("button").off("click");
            currentDiv.find(".toggle-discuss").find("button").attr("disabled", true);
            currentDiv.find(".toggle-share").find("button").off("click");
            currentDiv.find(".toggle-share").find("button").attr("disabled", true);

            $(".queue-back-button").off("click");            
            $(".queue-back-button").attr("disabled", true);
            $(".queue-forward-button").off("click");            
            $(".queue-forward-button").attr("disabled", true);     
        }
    }    
    function forwardProgress() {                  
        removeButtonListeners();
        preloadDirection = 1;
        currentFlag++;
        waitingOnContent = true;
        loadNextAvailable();              
    }
    function backwardProgress() {        
        removeButtonListeners();
        preloadDirection = -1;            
        currentFlag--;
        waitingOnContent = true;
        loadNextAvailable();               
    }
    function voteSubmit(voteForm) {                
        $.ajax($.extend(formlib.default_submit_ajax_options({ "form": voteForm }), {           
            url: fb.h.ajax_url("vote.ajax"),                        
            onsuccess: function(data) {                
                $(".vote-status").text(data.result.result);
                $(voteForm).find("button").addClass("cancel");
                $(voteForm).find("button").removeClass("save");
                $(voteForm).siblings(".vote-form").find("button").addClass("save");
                $(voteForm).siblings(".vote-form").find("button").removeClass("cancel");
            },
            onerror: function(data) {
                $(".vote-status").text("Error recording vote: " + JSON.stringify(data));
            }
        }));                      
    }

    function rebuildSearchParameters(params) {
        
        var browsingMsg = "You are currently viewing";
        var kindMsg;
        var domainMsg;
        var votedMsg;
        var createdMsg;
        var adminMsg;

        if(params.kind) {            
            if(params.kind === "merge" || params.kind === "split" || params.kind === "delete" || params.kind === "offensive") {                                        
                flagSearchParams.kind = params.kind;
                kindMsg = " " + params.kind + " flags";
            }                 
        } else {
            kindMsg = " flags";
        }

        if(params.domain) {              
           flagSearchParams.domain = params.domain;
           domainMsg = " in the " + params.domain + " domain";  
        }                
        
        // Default to not show flags we've created
        if(!params.created) { 
            params.created = "notcreated";
        }       
        if(params.created === "created") {
            flagSearchParams.created = params.created;
            createdMsg = " that you have created";
            params.voted = "both";
        }
        else if(params.created === "both") {
            flagSearchParams.created = null;            
        }
        else {
            flagSearchParams.created = "notcreated";
            createdMsg = " that you have not created";
        }
               
    
        // Default to not show flags we've voted on
        if(!params.voted) {
            params.voted = "notvotedon";
        }            
        if(params.voted === "votedon") {
            flagSearchParams.voted = params.voted;
            votedMsg = " that you have previously voted on";              
        }
        else if(params.voted === "both") {
            flagSearchParams.voted = null;                
        }
        else {
            flagSearchParams.voted = "notvotedon";
            votedMsg = " that you have not previously voted on";
        }
         
        // Default to not show admin flags

        if(!params.admin) {
            params.admin = "nonadmin";
        }           
        if(params.admin === "adminonly") {
            flagSearchParams.admin = params.admin;
            adminMsg = " in the admin queue";
        } else if (params.admin === "both") {
            flagSearchParams.admin = params.admin;               
        } else {
            flagSearchParams.admin = "nonadmin";
        }               

        if(kindMsg) {
            browsingMsg += kindMsg;
        }
        if(domainMsg) {
            browsingMsg += domainMsg;
        }
        if(votedMsg) {
            browsingMsg += votedMsg;
        }
        if(createdMsg) {
            if(votedMsg) browsingMsg += " and" + createdMsg;
            else browsingMsg += createdMsg;
        }
        if(adminMsg) {
            browsingMsg += adminMsg;
        }
        browsingMsg += ".";

        setBrowsingMessage(browsingMsg);    
    }
    function setBrowsingMessage(msg) {
        $("#queue-header-message").html(msg); 
    }


    // Utility, will be removed later
    function debug(msg) {
        // <div id="debugDiv"><div id="debugText"></div></div>
        $("#debugDiv").css('zIndex', 9999);
        $("#debugText").append(msg + "</br>");        
    }

    // On document.ready, show home or build our flag search and start our initial load
    $(function() {    
 
        var params = fb.c.params;

        if(!$.isEmptyObject(params)) {
            if(params.flags.length > 0) {
                setBrowsingMessage("You are viewing a custom list of flags.");
                loadedFlagsArray = params.flags.slice(0);                
            } else {
                rebuildSearchParameters(params); 
            }
            loadNextAvailable();
        } else { 
            // Eventually replace this with show homepage/leaderboard/browser here   
            loadNextAvailable(); 
        }              
    });


})(jQuery, window.freebase, window.formlib);
