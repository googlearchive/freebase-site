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
            for (var i = 0; i < o.result.length; i++) {
                var property = o.result[i];
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
            
        var url = CueCard.helper + "suggest-arbitrary-properties?q=" + encodeURIComponent(prefix);
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.PropertySuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};
