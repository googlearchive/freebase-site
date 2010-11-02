// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

CueCard.SerializingContext = function(parent) {
    this._parent = parent;
    this._root = (parent == null) ? this : parent.getRoot();
    this._properties = {};
}
CueCard.SerializingContext.prototype = {
    getProperty: function(name) {
        return (name in this._properties) ?
            this._properties[name] :
            (this._parent != null ? this._parent.getProperty(name) : null);
    },
    setProperty: function(name, value) {
        this._properties[name] = value;
    },
    getRoot: function() {
        return this._root;
    },
    getRootProperty: function(name) {
        return this.getRoot().getProperty(name);
    },
    setRootProperty: function(name, value) {
        return this.getRoot().setProperty(name, value);
    },
    create: function() {
        return new SerializingContext(this);
    }
};

CueCard.IndentWriter = function(context) {
    this._context = context;
    this._stream = context.getProperty("stream");
}
CueCard.IndentWriter.prototype = {
    appendLineBreak: function() {
        this._stream.append("\n");
    },
    appendIndent: function() {
        var indentLevel = this._context.getRootProperty("indentLevel");
        var indentString = this._context.getRootProperty("indentString");
        for (var i = 0; i < indentLevel; i++) {
            this._stream.append(indentString);
        }
    },
    indent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") + 1);
    },
    unindent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") - 1);
    },
    append: function(s) {
        this._stream.append(s);
    }
};
