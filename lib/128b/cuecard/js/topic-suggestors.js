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

CueCard.TypeBasedTopicSuggestor = function(popup, defaultSuggestions, expectedTypes, desiredProperty, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._expectedTypes = expectedTypes;
    this._desiredProperty = desiredProperty;
    this._onCommit = onCommit;
    
    this._popup.elmt.addClass("cuecard-popup-container-wide");
};

CueCard.TypeBasedTopicSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    if (prefix.length == 0) {
        var entries = [];
        
        for (var i = 0; i < this._defaultSuggestions.length; i++) {
            entries.push(this._defaultSuggestions[i]);
        }
        
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            var result = o.result;
            var entries = [];
            
            for (var i = 0; i < result.length; i++) {              
                var topic = result[i];
                topic.imageURL = null;
                if ("/common/topic/image" in topic && topic["/common/topic/image"] != null && topic["/common/topic/image"].length > 0) {
                    topic.imageURL = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + topic["/common/topic/image"][0].id + "?mode=fillcrop&maxwidth=40&maxheight=40";
                }

                entries.push({
                    result: topic[self._desiredProperty],
                    elmt: $(
                        '<a class="cuecard-suggestion-entry" href="javascript:{}"><table cellpadding="0" cellspacing="0"><tr valign="top">' + 
                            '<td valign="top">' + 
                                (topic.imageURL == null ? 
                                    '<div class="cuecard-suggestion-thumbnail-empty"> </div>' :
                                    ('<img src="' + topic.imageURL + '" />')) + 
                            '</td>' +
                            '<td valign="top">' +
                                topic.name + 
                                '<div class="cuecard-suggestion-id">' + topic[self._desiredProperty] + '</div>' +
                            '</td>' +
                        '</tr></table></a>'
                    )
                });
            }

            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-values-of-types?t=" +
                encodeURIComponent(this._expectedTypes.join(",")) + "&q=" + encodeURIComponent(prefix);
        
        $.ajax(url, {
          dataType: "json",
          success: cont.onDone,
          error: cont.onError
        });
    }
};

CueCard.TypeBasedTopicSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};
