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
;(function($, fb) {

    fb.discuss = fb.discuss || {};

    $.extend(fb.discuss, {
        
        toggle_discuss: function(id) {
           
            var pageDiv = $("#page-content-wrapper");
            var discDiv = $("#page-discuss-wrapper");      
            var toPageWidth; 
            var toDiscWidth;

            if (discDiv.width() > 0) { // Close discuss                
                toPageWidth = "100%";
                toDiscWidth = 0;
            } else {  // Open discuss               
                toPageWidth = "73%";
                toDiscWidth = "23%";                
                discDiv.show();

                if (!discDiv.data("initialized")) {
                    $("#discuss-frame").attr("src", fb.discuss.docos_url(id));
                    discDiv.data("initialized", true);
                }
            }
            
            var animationsCompleted = 0;
            function transitionComplete() {
                if (toDiscWidth === 0) {
                    discDiv.hide();      
                }
            }   

            pageDiv.animate({'width': toPageWidth},{
                duration: "normal",
                complete: function() {                    
                    animationsCompleted++;
                    if (animationsCompleted === 2) {
                        transitionComplete();
                    }
                }                
            });            
            discDiv.animate({"width": toDiscWidth},{
                duration: "normal",
                complete: function() {
                    animationsCompleted++;
                    if (animationsCompleted === 2) {
                        transitionComplete();
                    }
                }
            }); 
        },

        /**
         * Get the discuss url for a given id. This will be the url
         * of the discussions iframe.
         *
         * id: the id of the object to discuss as a string.
         */
        docos_url : function(id) {

          if (id.charAt(0) !== '/') {
            return "";
          }

          // Temporary - figure out why docos namespaces have to start with m-
          // Probably a mis-configuration.
          if (id.indexOf("/m/") != 0) {
          id = "/m" + id;
          }

          var docosKey = "FREEBASE-0" + id.replace(/\//g, "-");
          if (fb.acre.request.server_name.indexOf("sandbox-freebase.com") != -1) {
            var lastSunday = new Date();
            lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
            docosKey += "-" + lastSunday.getFullYear() + (lastSunday.getMonth()+1) + lastSunday.getDate();
          }

          if (docosKey === "") {
            return "";
          }

          return "https://docs.google.com/comments/d/" + docosKey + "/embed";
        }
    });

})(jQuery, window.freebase);
