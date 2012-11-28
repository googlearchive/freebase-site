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

CueCard.PropertySuggestor = function(popup, defaultSuggestions, propertyEntries, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._entries = propertyEntries;
    this._onCommit = onCommit;
};

CueCard.PropertySuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    var propertyMap = {};
    
    for (var i = 0; i < this._entries.length; i++) {
        var entry = this._entries[i];
        if (prefix.length == 0) {
            entries.push(entry);
        } else if (entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        } else {
            for (var j = 0; j < entry.expectedTypes.length; j++) {
                var expectedType = entry.expectedTypes[j];
                if (expectedType.name.toLowerCase().indexOf(prefix) >= 0) {
                    entries.push({
                        label:              entry.label,
                        hint:               entry.hint + " &rarr; type " + expectedType.id,
                        qualifiedProperty:  entry.qualifiedProperty,
                        result:             entry.result,
                        offset:             entry["offset"],
                        extent:             entry["extent"]
                    });
                    propertyMap[entry.qualifiedProperty] = true;
                    
                    break;
                }
            }
        }
    }
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    if (prefix.length < 3 && entries.length > 3) {
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            var result = o.result;
            for (var i = 0; i < result.length; i++) {
                var property = result[i];
                if (!(property.id in propertyMap) && 
                    "/type/property/schema" in property && 
                    property["/type/property/schema"] != null && 
                    property["/type/property/schema"].length > 0 &&
                    "key" in property &&
                    property.key != null &&
                    property.key.length > 0
                ) {
                    
                    var expectedTypes = "/type/property/expected_type" in property && property["/type/property/expected_type"] != null ?
                        property["/type/property/expected_type"] : [];
                        
                    var entry = {
                        label:              property.key[0],
                        hint:               "of type " + property["/type/property/schema"][0].id,
                        qualifiedProperty:  property.id,
                        expectedTypes:      expectedTypes
                    };
                    
                    var resultPrefix = '"' + property.id + '" : ';
                    CueCard.QueryEditor.setPropertySuggestionSuffix(expectedTypes.length > 0 ? expectedTypes[0] : "", entry, entry["/type/property/unique"], resultPrefix);
                    
                    entries.push(entry);
                }
            }
            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-arbitrary-properties.ajax?q=" + encodeURIComponent(prefix);
        
        $.ajax(url, {
          dataType: "json",
          success: cont.onDone,
          error: cont.onError
        });
    }
};

CueCard.PropertySuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};
