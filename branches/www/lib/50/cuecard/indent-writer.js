/*
 * Copyright 2010, Google Inc.
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
