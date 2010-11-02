CueCard.StaticChoicesSuggestor = function(defaultSuggestions, onCommit) {
    this._defaultSuggestions = defaultSuggestions;
    this._onCommit = onCommit;
};

CueCard.StaticChoicesSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    onDone(entries);
};

CueCard.StaticChoicesSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};
