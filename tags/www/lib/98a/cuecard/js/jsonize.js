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

// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

/*
 *  Some code adapted from http://www.json.org/json.js.
 */
(function() {
    var javascriptEscapeCharacters = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\'': '\\\'',
        '\\': '\\\\'
    };

    function encodeJavascriptString(x) {
        if (/["\\\x00-\x1f]/.test(x)) {
            return x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = javascriptEscapeCharacters[b];
                if (c) {
                    return c;
                }
                c = b.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            });
        } else {
            return x;
        }
    }
    
    function isObject(o) {
        return o != null && typeof o == "object" && !(o instanceof Array) && !("__identifier__" in o);
    }
    
    function isArray(o) {
        return o != null && o instanceof Array;
    }
    
    function objectHasFields(o) {
        for (var n in o) {
            if (o.hasOwnProperty(n)) {
                return true;
            }
        }
        return false;
    }
    
    function arrayIsEffectivelyEmpty(a) {
        return a.length == 0 || (a.length == 1 && isObject(a[0]) && !objectHasFields(a[0]));
    }

    var jsonize = CueCard.jsonize = function(o, params) {
        params = (params) ? params : {};
        
        var result = "";
        
        var quoteAllFieldNames = ("quoteAllFieldNames" in params) ? params.quoteAllFieldNames : true;
        var variables = ("variables" in params) ? params.variables : {};
        var resolveVariables = ("resolveVariables" in params) ? params.resolveVariables : false;
        
        if ("context" in params) {
            var context = new CueCard.SerializingContext(params.context);
        } else {
            var indentCount = ("indentCount" in params) ? params.indentCount : 4;
            var indentString = ""; for (var i = 0; i < indentCount; i++) indentString += " ";
        
            var context = new CueCard.SerializingContext(null);
            context.setProperty("indentCount", indentCount);
            context.setProperty("indentString", indentString);
            context.setProperty("indentLevel", 0);
            context.setProperty("stream", {
                append: function(s) {
                    result += s;
                }
            });
        }
        context.setProperty("omitWhitespace", ("omitWhitespace" in params) ? params.omitWhitespace : false);
        context.setProperty("maxFieldLength", ("maxFieldLength" in params) ? params.maxFieldLength : 15);
        context.setProperty("breakLines", ("breakLines" in params) ? params.breakLines : true);
        context.setProperty("alignFieldValues", ("alignFieldValues" in params) ? params.alignFieldValues : true);
        context.setProperty("collapseSingleObjectArray", ("collapseSingleObjectArray" in params) ? params.collapseSingleObjectArray : true);
        context.setProperty("variables", variables);
        context.setProperty("resolveVariables", resolveVariables);
        context.setProperty("encodeJavascriptString", ("encodeJavascriptString" in params) ? params["encodeJavascriptString"] : encodeJavascriptString);
        
        context.setRootProperty("fieldNameEncoder", {
            _m: {},
            encode: function(s) {
                if (s in this._m) {
                    return this._m[s];
                } else {
                    var t = encodeJavascriptString(s);
                    this._m[s] = t = (quoteAllFieldNames || /\W/.test(t)) ? ('"' + t + '"') : t;
                    return t;
                }
            }
        });
        context.setProperty("path", []);
        context.setRootProperty(
            "contextualize", 
            ("contextualize" in params) ? params.contextualize :
                function(context, path) {
                    return context;
                }
        );
        
        var writer = new CueCard.IndentWriter(context);
        jsonize.converters['anything'](o, context, writer);
        
        return result;
    }

    jsonize.converters = {
        'anything': function(o, context, writer) {
            if (o == null) {
                jsonize.converters['null'](o, context, writer);
            } else if (o instanceof Array) {
                jsonize.converters['array'](o, context, writer);
            } else if (o instanceof Object) {
                jsonize.converters['object'](o, context, writer);
            } else {
                jsonize.converters[typeof o](o, context, writer);
            }
        },
        'array': function (a, context, writer) {
            var omitWhitespace = context.getProperty("omitWhitespace");
            var breakLines = context.getProperty("breakLines");
            
            if (a.length == 0) {
                writer.append('[]');
                return;
            } else if (a.length == 1) {
                if (isObject(a[0])) {
                    if (objectHasFields(a[0])) {
                        if (context.getProperty("collapseSingleObjectArray")) {
                            writer.append('[');
                            
                            var v = a[0];
                            jsonize.converters['object'](v, context, writer);
                            
                            writer.append(']');
                            return;
                        }
                    } else {
                        writer.append('[{}]');
                        return;
                    }
                }
            }
            
            writer.append('[');
            if (breakLines) {
                writer.appendLineBreak();
                writer.indent();
            } else if (!omitWhitespace) {
                writer.append(" ");
            }
            
            var l = a.length;
            for (var i = 0; i < l; i ++) {
                var v = a[i];
                var f = jsonize.converters[v == null ? 'null' : typeof v];
                if (f) {
                    if (breakLines) {
                        writer.appendIndent();
                    }
                    
                    f(v, context, writer);
                    if (i < l - 1) {
                        writer.append(',');
                    }
                    
                    if (breakLines) {
                        writer.appendLineBreak();
                    } else if (!omitWhitespace) {
                        writer.append(" ");
                    }
                }
            }
            
            if (breakLines) {
                writer.unindent();
                writer.appendIndent();
            }
            writer.append(']');
        },
        'boolean': function (x, context, writer) {
            writer.append(String(x));
        },
        'null': function (x, context, writer) {
            writer.append("null");
        },
        'undefined': function (x, context, writer) {
            writer.append("undefined");
        },
        'number': function (x, context, writer) {
            writer.append(isFinite(x) ? String(x) : "null");
        },
        'object': function (x, context, writer) {
            if (x instanceof Array) {
                jsonize.converters['array'](x, context, writer);
            } else if ("__identifier__" in x) {
                var identifier = x["__identifier__"];
                var resolve = context.getProperty("resolveVariables");
                var variables = context.getProperty("variables");
                
                if (identifier in variables) {
                    if (resolve) {
                        var v = variables[identifier];
                        jsonize.converters['anything'](v, context, writer);
                    } else {
                        writer.append(identifier);
                    }
                } else {
                    // Always turn it into a string if the identifier isn't defined.
                    jsonize.converters['anything'](identifier, context, writer);
                }
            } else {
                var contextualize = context.getRootProperty("contextualize");
                var path = context.getProperty("path");
                
                var omitWhitespace = context.getProperty("omitWhitespace");
                var breakLines = context.getProperty("breakLines");
                var alignFieldValues = context.getProperty("alignFieldValues");
                
                writer.append('{');
                if (breakLines) {
                    writer.appendLineBreak();
                    writer.indent();
                } else if (!omitWhitespace) {
                    writer.append(" ");
                }
                
                var count = 0;
                var maxFieldLength = 0;
                var fieldNameEncoder = context.getRootProperty("fieldNameEncoder");
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        count++;
                        if (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v))) {
                            maxFieldLength = Math.max(maxFieldLength, fieldNameEncoder.encode(n).length);
                        }
                    }
                }
                maxFieldLength = Math.min(maxFieldLength, context.getProperty("maxFieldLength"));
                
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        var f = jsonize.converters[v == null ? 'null' : typeof v];
                        var n2 = fieldNameEncoder.encode(n);
                    
                        if (breakLines) {
                            writer.appendIndent();
                        }
                        
                        writer.append(n2);
                        writer.append(omitWhitespace ? ":" : ": ");
                        
                        if (!omitWhitespace && breakLines && alignFieldValues && (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v)))) {
                            for (var q = n2.length; q < maxFieldLength; q++) {
                                writer.append(" ");
                            }
                        }
                        
                        path.unshift({ field: n });
                        f(v, contextualize(context, path), writer);
                        path.shift();
                        
                        count--;
                        if (count > 0) {
                            writer.append(',');
                        }
                        
                        if (breakLines) {
                            writer.appendLineBreak();
                        } else if (!omitWhitespace) {
                            writer.append(" ");
                        }
                    }
                }
                
                if (breakLines) {
                    writer.unindent();
                    writer.appendIndent();
                }
                writer.append('}');
            }
        },
        'string': function (x, context, writer) {
            writer.append('"' + context.getProperty("encodeJavascriptString")(x) + '"');
        },
        'null': function(x, context, writer) {
            writer.append('null');
        }
    };

    function dontBreakLinesForFields() {
        var m = {};
        for (var i = 0; i < arguments.length; i++) {
            m[arguments[i]] = true;
        }
        return function(context, path) {
            if (path.length > 0 && path[0].field in m) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }

    function dontBreakLinesAfterDepth(d) {
        return function(context, path) {
            if (path.length == d) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }
})();
