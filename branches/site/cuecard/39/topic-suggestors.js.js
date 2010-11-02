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
            var entries = [];
            
            for (var i = 0; i < o.result.length; i++) {
                var topic = o.result[i];
                var imageURL = null;
                if ("/common/topic/image" in topic && topic["/common/topic/image"] != null && topic["/common/topic/image"].length > 0) {
                    imageURL = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + topic["/common/topic/image"][0].id + "?mode=fillcrop&maxwidth=40&maxheight=40";
                }
                
                entries.push({
                    result: topic[self._desiredProperty],
                    elmt: $(
                        '<a class="cuecard-suggestion-entry" href="javascript:{}"><table cellpadding="0" cellspacing="0"><tr valign="top">' + 
                            '<td valign="top">' + 
                                (imageURL == null ? 
                                    '<div class="cuecard-suggestion-thumbnail-empty"> </div>' :
                                    ('<img src="' + imageURL + '" />')) + 
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
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.TypeBasedTopicSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};
