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

CueCard.OutputPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._jsonResult = null;
    this._lastJsonOutputMode = $.cookie("cc_op_mode") == "text" ? "text" : "tree";
    this._treeConstructed = false;
    
    this._constructUI();
};

CueCard.OutputPane.prototype.dispose = function() {
    // TODO
};

CueCard.OutputPane.prototype._constructUI = function() {
    var self = this;
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    
    this._elmt.acre("output-pane", "tabs", [idPrefix, this]);
    
    var tabs = $('#' + idPrefix + " > .section-tabset");
    tabs.tabs('#' + idPrefix + " > .tabbed-content > .cuecard-outputPane-tabBody", {
      "initialIndex": (this._lastJsonOutputMode == "tree") ? 0 : 1,
      "onBeforeClick": function(event, index) {
        window.__cc_tree_disposePopup();
        if (index == 0) { // tree
            self._lastJsonOutputMode = "tree";
            if (self._jsonResult != null && !self._treeConstructed) {
                self._constructTree();
            }
        } else if (index == 1) {
            self._lastJsonOutputMode = "text";
        }
        
        $.cookie("cc_op_mode", self._lastJsonOutputMode, { expires: 365 });
      }
    });
    this._tabs = tabs.data("tabs");
    
    this._tree = this._getTab("tree").find("div");
    this._textarea = this._getTab("text").find("textarea");
    this._status = this._getTab("status").find("div");
};

CueCard.OutputPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
};

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings) {
    this._jsonResult = o;
    this._textarea[0].value = CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 });
    
    var tabToSelect;
    if (this._lastJsonOutputMode == "tree") {
        this._constructTree();
        tabToSelect = 0;
    } else {
        this._tree.empty();
        this._treeConstructed = false;
        tabToSelect = 1;
    }
    
    var self = this;
    var selectTab = function() {
        self._tabs.click(tabToSelect);
    };
    
    // tabs have to be selected asynchronously or Chrome will crash.
    window.setTimeout(selectTab, 100);
};

CueCard.OutputPane.prototype.setStatus = function(html) {
    this._tabs.click(2);
    this._status.html(html);
    
    this._jsonResult = null;
    this._textarea.val("");
    this._tree.empty();
    this._treeConstructed = false;
};

CueCard.OutputPane.prototype.getJson = function() {
    return this._jsonResult;
};

CueCard.OutputPane.prototype.renderResponseHeaders = function(headers) {
    this.setStatus($.acre("output-pane", "status", [headers]));
};

CueCard.OutputPane.prototype._constructTree = function() {
    var self = this;
    
    /*
     *  WARNING: Unless you know what you're doing, the code in this function
     *  is very fragile. Do not change it.
     */
    
    this._treeConstructed = true;
    
    var html = [];
    var makeImage = function(url, visible) {
        return '<img class="cuecard-outputPane-tree-toggle" onclick="__cc_tree_toggle(this);" src="' + CueCard.urlPrefix + url + '" ' + (visible ? '' : ' style="display: none;"') +'/>';
    };
    var append = function(s) {
        html.push(s);
    };
    var makeExploreLink = function(id) {
        return "<a class='cuecard-outputPane-tree-explore' target='_blank' href='" + CueCard.freebaseServiceUrl + "tools/explore" + id + "'>xp</a>";
    };
    var makeTopicLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverTopic(this)' onmouseout='__cc_tree_mouseOutTopic(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeImageLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeRawImageLink = function(url) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + url +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)'>" + 
                JSON.stringify(url) + 
            "</a>");
    };
    var makeBlurbLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverArticle(this)' onmouseout='__cc_tree_mouseOutArticle(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeSpecialLink = function(superFieldName, id, label) {
        if (superFieldName == "image" || superFieldName == "/common/topic/image") {
            makeImageLink(id, label);
        } else if (superFieldName == "article" || superFieldName == "/common/topic/article") {
            makeBlurbLink(id, label);
        } else {
            makeTopicLink(id, label);
        }
    };
    var startsWith = function(big, small) {
        return big.length > small.length && big.substr(0, small.length) == small;
    };
    var constructNode = function(o, appenders, path) {
        if (o == null) {
            appenders.startBody(false);
            append("<span>" + JSON.stringify(o) + "</span>");
            appenders.endBody(false);
        } else if (typeof o != "object") {
            appenders.startBody(false);
            
            var fieldName = path[0];
            var superFieldName = path.length > 1 ? path[1] : "";
            if (fieldName == "id" || fieldName == "/type/object/id") {
                makeSpecialLink(superFieldName, o, JSON.stringify(o));
            } else if (fieldName == "guid" || fieldName == "/type/object/guid") {
                makeSpecialLink(superFieldName, "/guid/" + o.substr(1), JSON.stringify(o));
            } else if (fieldName == "type" || fieldName == "/type/object/type") {
                append("<a target='_blank' href='" + CueCard.freebaseServiceUrl + "type/schema" + o + "'>" + JSON.stringify(o) + "</a>" + makeExploreLink(o));
            } else if (typeof o == "string" && (startsWith(o, "http://") || startsWith(o, "https://") || startsWith(o, "ftp://"))) {
                if (startsWith(o, "http://chart.apis.google.com/chart?")) {
                    makeRawImageLink(o);
                } else {
                    append("<a target='_blank' href='" + o + "'>" + JSON.stringify(o) + "</a>");
                }
            } else {
                append("<span>" + JSON.stringify(o) + "</span>");
            }
            appenders.endBody(false);
        } else if (o instanceof Array) {
            if (o.length == 0) {
                appenders.startBody(false);
                append("<span>[]</span>");
                appenders.endBody(false);
            } else {
                var style = (o.length > 1 && typeof o[0] == 'object') ? '' : ' style="display: none;"';
                
                appenders.startBody(true, 
                    '<span cc:mode="normal">[ ' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_expandAll(this);"' + style + '>expand all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_collapseAll(this);"' + style + '>collapse all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_flip(this);"' + style + '>1-by-1</a>' +
                    '</span>', 
                    '<span style="display: none;">[ ' + (o.length > 1 ? (o.length + ' elements') : '1 element') + ' ]</span>');
                append('<div class="cuecard-outputPane-tree-arrayBody cuecard-outputPane-tree-normalMode">');
                
                var makeAppenders = function(index, canGoBack, canGoForward) {
                    return {
                        startBody: function(collapsible, expandedHeader, collapsedHeader) {
                            if (collapsible) {
                                append('<div class="cuecard-outputPane-tree-arrayElement">' +
                                    makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                    '<span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ' +
                                    expandedHeader + 
                                    collapsedHeader +
                                    '<span>' +
                                        (canGoBack ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipPrevious(this);">previous</a> ' : '') +
                                        (canGoForward ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipNext(this);">next</a>' : '') +
                                    '</span>'
                                );
                            } else {
                                append('<div class="cuecard-outputPane-tree-arrayElement"><span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ');
                            }
                        },
                        endBody: function(collapsible) {
                            append('</div>');
                        }
                    };
                };
                
                for (var i = 0; i < o.length; i++) {
                    constructNode(o[i], makeAppenders(i, i > 0, i < o.length - 1), path);
                }
                
                append('</div>');
                appenders.endBody(true);
            }
        } else {
            appenders.startBody(true, 
                '<span>{</span>', 
                '<span style="display: none;">{...}</span>');
            append('<div class="cuecard-outputPane-tree-objectBody cuecard-outputPane-tree-normalMode">');
            
            var makeAppenders = function(fieldName) {
                return {
                    startBody: function(collapsible, expandedHeader, collapsedHeader) {
                        if (collapsible) {
                            append('<div class="cuecard-outputPane-tree-objectField">' +
                                makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                '<span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ' +
                                expandedHeader + 
                                collapsedHeader + 
                                '<span></span>'
                            );
                        } else {
                            append('<div class="cuecard-outputPane-tree-objectField"><span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ');
                        }
                    },
                    endBody: function(collapsible) {
                        append('</div>');
                    }
                };
            };
            
            for (var n in o) {
                constructNode(o[n], makeAppenders(n), [ n ].concat(path));
            }
            
            append('</div>');
            appenders.endBody(true);
        }
    };
    
    constructNode(this._jsonResult, {
        startBody: function(collapsible) {},
        endBody: function() {}
    }, [ "__root__" ]);
    this._tree.html(html.join(""));
};

window.__cc_tree_toggle = function(img) {
    var expanded = img.src.indexOf("expanded.png") > 0;
    var parent = img.parentNode;
    if (expanded) {
        window.__cc_tree_collapse(parent);
    } else {
        window.__cc_tree_expand(parent);
    }
};

window.__cc_tree_expand = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "block";
        
        elmt.childNodes[0].style.display = "inline";
        elmt.childNodes[1].style.display = "none";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "inline";
        collapsedHeader.style.display = "none";
    }
};

window.__cc_tree_collapse = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "none";
        
        elmt.childNodes[0].style.display = "none";
        elmt.childNodes[1].style.display = "inline";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "none";
        collapsedHeader.style.display = "inline";
    }
};

(function() {
    var restoreNormalMode = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "flip") {
            for (var i = 0; i < body.childNodes.length; i++) {
                body.childNodes[i].style.display = "block";
            }
            link.parentNode.setAttribute("cc:mode", "normal");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .addClass("cuecard-outputPane-tree-normalMode")
                .removeClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_expandAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_expand(body.childNodes[i]);
        }
    };

    window.__cc_tree_collapseAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_collapse(body.childNodes[i]);
        }
    };
    
    window.__cc_tree_flip = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "normal") {
            for (var i = 0; i < body.childNodes.length; i++) {
                var child = body.childNodes[i];
                child.style.display = i == 0 ? "block" : "none";
                __cc_tree_expand(child);
            }
            link.parentNode.setAttribute("cc:mode", "flip");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .removeClass("cuecard-outputPane-tree-normalMode")
                .addClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_flipPrevious = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.previousSibling.style.display = "block";
    };
    
    window.__cc_tree_flipNext = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.nextSibling.style.display = "block";
    };
    
    window.__cc_tree_mouseOverTopic = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON("http://hotshot.dfhuynh.user.dev.freebaseapps.com/html?id=" + id + "&callback=?",
            function(html) {
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-topic").html(html);
            }
        );
    };
    window.__cc_tree_mouseOutTopic = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverImage = function(elmt) {
        var id = elmt.getAttribute("fbid");
        if (id != null && id.length > 0) {
            var url = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + id + "?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100";
        } else {
            var url = elmt.href;
        }
        var div = __cc_tree_createPopup(elmt);
        div.innerHTML = "<img src='" + url + "' />";
    };
    window.__cc_tree_mouseOutImage = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverArticle = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON(CueCard.freebaseServiceUrl + "api/trans/blurb" + id + "?callback=?",
            function(data) {
                var text = data.result.body;
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-article").html(text);
            }
        );
    };
    window.__cc_tree_mouseOutArticle = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_createPopup = function(elmt) {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div == null) {
            div = document.createElement("div");
            div.id = "cuecard-outputPane-tree-popup";
            div.className = "cuecard-outputPane-tree-popup";
            div.onmouseover = window.__cc_tree_disposePopup;
            
            document.body.appendChild(div);
        }
        
        var pos = $(elmt).offset();
        div.style.top = (pos.top + elmt.offsetHeight + 10) + "px";
        div.style.left = (pos.left) + "px";
        
        return div;
    };
    window.__cc_tree_disposePopup = function() {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div != null) {
            div.parentNode.removeChild(div);
        }
    };
})();