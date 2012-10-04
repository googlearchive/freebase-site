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

CueCard.CodeGeneration = { serializers: {} };

CueCard.CodeGeneration.generate = function(queryJSON, serializer, options) {
    var result = "";
    
    var utils = {
        _variables: {},
        createVariable: function(prefix) {
            if (prefix in this._variables) {
                return prefix + this._variables[prefix]++;
            } else {
                this._variables[prefix] = 1;
                return prefix;
            }
        }
    };
    var qVar = utils.createVariable("q");
    var oVar = utils.createVariable("o");
    
    var context = new CueCard.SerializingContext(null);
    context.setProperty("indentString", "indentString" in options ? options.indentString : "  ");
    context.setProperty("indentLevel", "indentLevel" in options ? options.indentLevel : 0);
    context.setProperty("stream", {
        append: function(s) {
            result += s;
        }
    });
    serializer.prepareRootContext(context, options);
    
    var writer = new CueCard.IndentWriter(context);
    var resultExpr = serializer.generateQueryCall(context, writer, utils, queryJSON, options.variables, qVar, oVar);
    context.setProperty("start", function() {
        return resultExpr;
    });
    context.setProperty("stop", function() {
    });
    
    CueCard.CodeGeneration._processNode(queryJSON, serializer, context, writer, utils);
    
    return result;
};

CueCard.CodeGeneration._deriveElementName = function(type, context) {
    if (type == null) {
        var path = context.getProperty("path");
        if (path != null) {
            if (path.charAt(0) == "!") {
                var segments = path.substr(Math.max(path.indexOf(":") + 1, 1)).split("/");
                return segments[Math.max(0, segments.length - 2)];
            } else {
                var segments = path.substr(path.indexOf(":") + 1).split("/");
                return segments[segments.length - 1];
            }
        }
    } else {
        var segments = type.split("/");
        return segments[segments.length - 1];
    }

    return "entry";
};

CueCard.CodeGeneration._isImagePath = function(path) {
    if (path.charAt(0) == "!") {
        return false;
    }
    path = path.substr(path.indexOf(":") + 1);
    return path == "/common/topic/image" || path == "image";
};

CueCard.CodeGeneration._isImageNode = function(node) {
    if (node == null || typeof node != "object") {
        return false;
    }
    if (node instanceof Array) {
        if (node.length == 1 && typeof node[0] == "object") {
            node = node[0];
        } else {
            return false;
        }
    }
    
    for (var n in node) {
        if (n != "id" && n != "guid" && !CueCard.QueryNode.isMqlKeyword(n)) {
            return false;
        }
    }
    return true;
};

CueCard.CodeGeneration._processNode = function(node, serializer, context, writer, utils) {
    if (node == null) {
        var expr = context.getProperty("start")(true, false);
        serializer.outputSimpleFieldValue(expr, context, writer);
        context.getProperty("stop")(true, false);
    } else if (typeof node != "object") {
        // A constraint value
        return;
    } else if (node instanceof Array) {
        if (node.length == 0) {
            var elementName = CueCard.CodeGeneration._deriveElementName(null, context);
            var elementVar = utils.createVariable(elementName);
            var indexVar = utils.createVariable(elementName.charAt(0));
            
            var expr = context.getProperty("start")(false, false);
            serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            
            serializer.outputSimpleFieldValue(elementVar, context, writer);
            
            serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            context.getProperty("stop")(false, false);
            
        } else if (node.length > 1 || typeof node[0] != "object" || "__identifier__" in node) {
            // An array of constraint values
            return;
        } else {
            var context2 = new CueCard.SerializingContext(context);
            context2.setProperty("in-array", true);
            
            arguments.callee(node[0], serializer, context2, writer, utils);
        }
    } else if (node["optional"] != "forbidden") {
        var type = null;
        
        var fieldCount = 0;
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                fieldCount++;
                
                var v = node[n];
                if (n.charAt(0) != "!") {
                    var n2 = n.substr(n.indexOf(":") + 1);
                    if (n2 == "type" || n2 == "/type/object/type") {
                        if (v != null && typeof v == "string") {
                            type = v;
                        }
                    }
                }
            }
        }
        
        CueCard.CodeGeneration._processTypedObjectNode(node, type, fieldCount, serializer, context, writer, utils);
    }
};

CueCard.CodeGeneration._processTypedObjectNode = function(node, type, fieldCount, serializer, context, writer, utils) {
    var expr = null;
    var elementVar = null;
    var indexVar = null;
    var start, stop;
    var optional = ("optional" in node && node.optional === true);
    
    function prepareVariables() {
        // This is only called when we really need it, or we will waste variable names.
        
        var elementName = CueCard.CodeGeneration._deriveElementName(type, context);
        elementVar = utils.createVariable(elementName);
        if (context.getProperty("in-array")) {
            indexVar = utils.createVariable(elementName.charAt(0));
        }
    };
    
    if (context.getProperty("in-array")) {
        var elementsAreObjects = (fieldCount > 0 && !("*" in node));
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
                context.getProperty("stop")(false, optional);
            }
        };
    } else {
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNode(context, writer, utils, expr, elementVar);
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNode(context, writer, utils, expr, elementVar);
                context.getProperty("stop")(false, optional);
            }
        };
    }
    
    if (fieldCount == 0 || "*" in node) {
        serializer.generateEmptyObjectNode(context, writer, utils, start());
    } else {
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                var v = node[n];
                if (CueCard.CodeGeneration._isImagePath(n) && CueCard.CodeGeneration._isImageNode(v)) {
                    serializer.generateImageField(context, writer, utils, n, v, start);
                } else {
                    var context2 = serializer.createFieldContext(context, writer, utils, n, start);
                    context2.setProperty("path", n);
                    
                    CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
                }
            }
        }
        if ("*" in node) {
            var v = node["*"];
            var context2 = serializer.openWildcardField(context, writer, utils, start, v);
            
            CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
            
            serializer.closeWildcardField(context, writer, utils, start, v);
        }
    }
    stop();
};

CueCard.CodeGeneration.serializers["acre-template"] = {
    prepareRootContext: function(context, options) {
        
    },
    generateQueryCall: function(context, writer, utils, queryJSON, variables, qVar, oVar) {
        writer.appendIndent(); writer.append("<acre:script>"); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('var ' + qVar + ' = ');
            CueCard.jsonize(queryJSON, { context: context, variables: variables, resolveVariables: false });
            writer.append(";"); writer.appendLineBreak();
        writer.appendIndent(); writer.appendLineBreak();
        writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +');'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append("</acre:script>"); writer.appendLineBreak();
        
        return oVar + ".result";
    },
    outputSimpleFieldValue: function(expression, context, writer) {
        writer.append("${" + expression + "}");
    },
    openNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        writer.appendLineBreak();
        
        writer.appendIndent(); writer.append('<ul acre:if="' + expr + '.length != 0">'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<li acre:for="' + indexVar + ', ' + elementVar + ' in ' + expr + '">');
        if (mode == "fields") {
            writer.append('<table>');
        }
        if (mode == "fields" || mode == "object") {
            writer.appendLineBreak();
            writer.indent();
        }
    },
    closeNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        if (mode == "fields" || mode == "object") {
            writer.unindent();
            writer.appendIndent();
        }
        if (mode == "fields") {
            writer.append('</table>');
        }
        writer.append('</li>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</ul>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<div acre:else=""><ins>[no element]</ins></div>'); writer.appendLineBreak();
        
        writer.appendLineBreak();
    },
    openNode: function(context, writer, utils, expr, elementVar) {
        writer.appendIndent(); writer.append('<acre:script>var ' + elementVar + ' = ' + expr + ';</acre:script>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();
    },
    closeNode: function(context, writer, utils, expr, elementVar) {
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    },
    createFieldContext: function(context, writer, utils, fieldPath, start) {
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            var objectVar = start();
            
            writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
            writer.indent();
            
            writer.appendIndent(); writer.append('<td' + 
                (optional ? ' acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + objectVar + '[\'' + fieldPath + '\'] != null"' : '') +
                '>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return objectVar + '[\'' + fieldPath + '\']';
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
            if (optional) {
                writer.appendIndent(); writer.append('<td acre:else=""><ins>[no value]</ins></td>'); writer.appendLineBreak();
            }
            
            writer.unindent();
            writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    generateImageField: function(context, writer, utils, fieldPath, queryNode, start) {
        var objectVar = start();
        var expr = objectVar + '[\'' + fieldPath + '\']';
        
        writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + expr + ' != null">'); writer.appendLineBreak();
        writer.indent();
        
        var multiple = (queryNode instanceof Array);
        
        writer.appendIndent();
        if (multiple) {
            queryNode = queryNode[0];
            
            var imageNodeVar = utils.createVariable("image");
            var imageIndexVar = utils.createVariable("i");
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + imageNodeVar + ".guid.substr(1)}") : ('${' + imageNodeVar + '.id}');
            
            writer.append(
                '<img acre:for="' + imageIndexVar + ', ' + imageNodeVar + ' in ' + expr + '" ' +
                    'src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        } else {
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + expr + ".guid.substr(1)}") : ('${' + expr + '.id}');
            writer.append(
                '<img src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        }
        writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('<td acre:else=""><ins>[no image]</ins></td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    openWildcardField: function(context, writer, utils, start, valueNode) {
        var objectVar = start();
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + objectVar + '"><td>${' + fieldVar + '}:</td>'); writer.appendLineBreak();
        writer.indent();
        
        var fieldValueExpr = valueVar;
        
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            writer.appendIndent(); writer.append('<td>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return fieldValueExpr;
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    closeWildcardField: function(context, writer, utils, start, valueNode) {
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    generateEmptyObjectNode: function(context, writer, utils, expr) {
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();

        var fieldValueExpr = valueVar;
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + expr + '">' +
            '<th>${' + fieldVar + '}:</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="' + fieldValueExpr + ' instanceof Array">${' + fieldValueExpr + '.join(\', \')}</td>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<td acre:else="">${' + fieldValueExpr + '}</td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    }
};

