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

CueCard.ControlPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._constructUI();
    this.layout();
};

CueCard.ControlPane.prototype.dispose = function() {
    // TODO
};

CueCard.ControlPane.prototype.layout = function() {
    var height = (
        this._elmt[0].firstChild.offsetHeight - 
        this._elmt[0].firstChild.firstChild.firstChild.offsetHeight - 
        10 // paddings
    ) + "px";
    this._elmt.find('.cuecard-controlPane-tabBody').css("height", height);
};

CueCard.ControlPane.prototype._constructUI = function() {
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    
    function makeTabHeaderHTML(index, label) {
        return '<li class="section-tab tab"><a href="#' + idPrefix + '-' + index + '"><span>' + label + '</span></a></li>';
    }
    function makeTabBodyHTML(index) {
        return '<div class="cuecard-controlPane-tabBody" id="' + idPrefix + '-' + index + '"></div>';
    }
    
    this._elmt.html(
        '<div class="cuecard-controlPane section-tabs">' +
            '<div id="' + idPrefix + '">' +
                '<ul class="section-tabset clear">' +
                    makeTabHeaderHTML(0, 'Tools') +
                    makeTabHeaderHTML(1, 'Variables') +
                    makeTabHeaderHTML(2, 'Envelope') +
                    makeTabHeaderHTML(3, 'Custom Envelope') +
                    makeTabHeaderHTML(4, 'Settings') +
                '</ul>' +
                '<div class="tabbed-content">' +
                    makeTabBodyHTML(0) +
                    makeTabBodyHTML(1) +
                    makeTabBodyHTML(2) +
                    makeTabBodyHTML(3) +
                    makeTabBodyHTML(4) +
                '</div>' +
            '</div>' +
        '</div>'
    );
    $('#' + idPrefix + " > .section-tabset").tabs('#' + idPrefix + " > .tabbed-content > .cuecard-controlPane-tabBody", { initialIndex: 0 });
    
    var tabBodies = this._elmt.find('.cuecard-controlPane-tabBody');
    this._toolsTabBody = $(tabBodies[0]);
    this._variablesTabBody = $(tabBodies[1]);
    this._envelopeTabBody = $(tabBodies[2]);
    this._customEnvelopeTabBody = $(tabBodies[3]);
    this._settingsTabBody = $(tabBodies[4]);
    
    this._constructToolsTabBody();
    this._constructVariablesTabBody();
    this._constructEnvelopeTabBody();
    this._constructCustomEnvelopeTabBody();
    this._constructSettingsTabBody();
};

CueCard.ControlPane.prototype._constructToolsTabBody = function() {
    var id = "r" + Math.floor(1000000 * Math.random());
    var self = this;
    
    var makeButton = function(command, label, hint) {
        return '<div class="cuecard-controlPane-powerTool">' +
            '<input type="submit" class="button" cc:command="' + command + '" value="' + label + '" />' +
            '<div class="cuecard-controlPane-powerTool-hint">' + hint + '</div>' +
        '</div>';
    };
    
    this._toolsTabBody.html(
        '<div class="cuecard-controlPane-section">' +
            '<table><tr valign="top">' +
                '<td>' +
                    makeButton('qualify', 'Qualify All Properties',
                        'Expand all properties to their full IDs (e.g., "id" &rarr; "/type/object/id").') +
                    makeButton('redangle', 'Turn Inside Out',
                        'Take the inner most query node {...} that contains the text cursor and make it the outermost query node.') +
                    makeButton('generate', 'Generate Acre Template',
                        'Generate an ACRE template that can render the result of this query.') +
                    makeButton('one-liner', 'One-liner',
                        'Reformat query into a one-liner.') +
                '</td>' +
                '<td width="40%">' +
                    'Results of tools<br/>' +
                    '<input type="radio" name="' + id + '" value="replace" checked="true"> replace query (undo-able)<br/>' +
                    '<input type="radio" name="' + id + '" value="output"> go into output pane' +
                '</td>' +
            '</tr></table>' +
        '</div>'
    );
    
    this._toolsTabBody.find(".button").click(function(evt) {
        return self._onCommandClick(evt, this, this.getAttribute("cc:command"));
    });
};

CueCard.ControlPane.prototype._constructVariablesTabBody = function() {
    this._variablesTabBody.html(
        '<table class="cuecard-controlPane-variables">' +
            '<tr><th width="30%">name</th><th width="50%">value</th><th></th></tr>' +
        '</table>' +
        '<div><input type="submit" class="button" value="Add" /></div>'
    );
    
    var self = this;
    var add = function(dontFocus) {
        var table = self._variablesTabBody.find('table')[0];
        var tr = table.insertRow(table.rows.length);
        
        var td0 = tr.insertCell(0);
        td0.innerHTML = "<input />";
        
        var td1 = tr.insertCell(1);
        td1.innerHTML = "<input />";
        
        var td2 = tr.insertCell(2);
        td2.innerHTML = '<input type="submit" class="button" value="Remove" />';
        $(td2.firstChild).click(function() { $(tr).remove(); });
        
        if (!(dontFocus)) {
            td0.firstChild.focus();
        }
    };
    
    this._variablesTabBody.find('.button').click(add);
    add(true);
};

CueCard.ControlPane.prototype._constructEnvelopeTabBody = function() {
    var makeRow = function(label, controls, hint) {
        return '<tr><td>' + 
            label + '</td><td>' + controls + 
            (hint.length > 0 ? ('<div class="cuecard-controlPane-hint">' + hint + '</div>') : '') +
            '</td></tr>';
    };
    
    var languageOptions = [ '<option value="">--</option>' ];
    for (var i = 0; i < CueCard.Languages.length; i++) {
        var l = CueCard.Languages[i];
        languageOptions.push('<option value="' + l.id + '">' + l.name + ' (' + l.id + ')</option>');
    }
    
    this._envelopeExtendedID = "i" + Math.floor(1000000 * Math.random());
    this._envelopeAsOfTimeID = "i" + Math.floor(1000000 * Math.random());
    this._envelopeUsePermissionOfID = "i" + Math.floor(1000000 * Math.random());
    this._envelopeCursorID = "i" + Math.floor(1000000 * Math.random());
    this._envelopePageID = "i" + Math.floor(1000000 * Math.random());
    
    var env = "env" in this._options ? this._options.env : {};
    var extended = ("extended" in this._options ? (this._options.extended == 1) : false) || ("extended" in env ? env.extended == 1 : false);
    var as_of_time = "as_of_time" in this._options ? this._options.as_of_time : ("as_of_time" in env ? env.as_of_time : null);
    var use_permission_of = "use_permission_of" in this._options ? this._options.use_permission_of : ("use_permission_of" in env ? env.use_permission_of : null);
    delete env["extended"];
    delete env["as_of_time"];
    delete env["use_permission_of"];
    
    this._envelopeTabBody.html(
        '<div class="cuecard-controlPane-explanation">' +
            'The query envelope contains directives to the query engine, specifying how to execute the query or how to return the results.' +
        '</div>' +
        '<table class="cuecard-controlPane-configurations">' +
            makeRow('extended', '<input type="checkbox" name="' + this._envelopeExtendedID + '" ' + (extended ? 'checked' : '') + '/>', 
                'Enable MQL extensions') +
            makeRow('as_of_time', '<input name="' + this._envelopeAsOfTimeID + '" ' + (as_of_time != null  ? 'value="' + as_of_time + '"' : '') + '/>', 
                'Resolve the query based on data in Freebase as of the given time in ISO8601 format, e.g., 2009-02-28, 2009-03-13T22:16:40') +
            makeRow('use_permission_of', '<input name="' + this._envelopeUsePermissionOfID + '" ' + (use_permission_of != null ? 'value="' + use_permission_of + '"' : '') + '/>', 
                'Specify the id of an object (typically a user, domain or type) whose permission you want to copy (<a href="http://freebaseapps.com/docs/mql/ch06.html#id2972357" target="_blank">more details</a>).') +
            makeRow('page', 
                '<input name="' + this._envelopePageID + '" /> <input type="submit" class="button cuecard-controlPane-configurations-page" value="Previous" /><input type="submit" class="button cuecard-controlPane-configurations-page" value="Next" />', 
                'Page number starting from 1 if there is a "limit" property in the top level query node.'
            ) +
            makeRow('cursor',
                '<div><input type="radio" name="' + this._envelopeCursorID + '" checked value=""> unspecified (return all results, possibly time-out)</div>' +
                '<div><input type="radio" name="' + this._envelopeCursorID + '" value="true"> true (start pagination with page size equal "limit" option in query)</div>' +
                '<div><input type="radio" name="' + this._envelopeCursorID + '" value="custom"> continue from cursor: ' +
                    '<div class="cuecard-controlPane-configurations-cursor">' +
                        '<input type="text" name="' + this._envelopeCursorID + '" />' +
                        '<input type="submit" class="button cuecard-controlPane-configurations-cursor" value="Paste from Last Result" /> <input type="submit" class="button" cc:run="true" value="Paste &amp; Run" />' +
                    '</div>' +
                '</div>',
                ''
            ) +
            makeRow('lang', '<select class="cuecard-controlPane-configurations-languages">' + languageOptions.join("") + '</select>', 'Return text values in the given language (specified with the language\'s Freebase ID)') +
            makeRow('escape', '<select><option value="">--</option><option value="html">html</option><option value="false">false</option></select>', '') +
            makeRow('uniqueness_failure', '<select><option value="">--</option><option value="soft">soft</option></select>', '') +
        '</table>'
    );
    
    var self = this;
    this._envelopeTabBody.find("input[type='text'][name='" + this._envelopeCursorID + "']").bind("change",
        function() {
            self._envelopeTabBody.find("input[type='radio'][value='custom']")[0].checked = true;
        }
    );
    this._envelopeTabBody.find(".button .cuecard-controlPane-configurations-cursor").click(
        function() {
            if (self._options.outputPane != null) {
                var o = self._options.outputPane.getJson();
                if (o !== undefined && o !== null && "cursor" in o) {
                    self._envelopeTabBody.find("input[type='text'][name='" + self._envelopeCursorID + "']")[0].value = o.cursor;
                    self._envelopeTabBody.find("input[type='radio'][value='custom']")[0].checked = true;
                    
                    if (self._options.queryEditor != null && this.getAttribute("cc:run") == "true") {
                        self._options.queryEditor.run();
                    }
                }
            }
        }
    );
    this._envelopeTabBody.find(".button .cuecard-controlPane-configurations-page").click(
        function() {
            var input = self._envelopeTabBody.find("input[type='text'][name='" + self._envelopePageID + "']")[0];
            var pageString = input.value;
            var page;
            try {
                page = parseInt(pageString);
            } catch (e) {}
            if (typeof page != "number" || isNaN(page)) {
                page = 1;
            }
            
            if (this.innerHTML == "Previous") {
                page--;
            } else {
                page++;
            }
            if (page < 1) {
                input.value = "1";
                return;
            } else {
                input.value = page;
                if (self._options.queryEditor != null) {
                    self._options.queryEditor.run();
                }
            }
        }
    );
};

CueCard.ControlPane.prototype._constructCustomEnvelopeTabBody = function() {
    var env = "env" in this._options ? this._options.env : {};
    
    this._customEnvelopeTabBody.html(
        '<table class="cuecard-controlPane-customEnvelope">' +
            '<tr><th width="30%">name</th><th width="50%">value</th><th></th></tr>' +
        '</table>' +
        '<div><input type="submit" class="button" value="Add" /></div>'
    );
    
    var self = this;
    var add = function(dontFocus, name, value) {
        var table = self._customEnvelopeTabBody.find('table')[0];
        var tr = table.insertRow(table.rows.length);
        
        var td0 = tr.insertCell(0);
        td0.innerHTML = "<input />";
        if (name) {
            td0.firstChild.value = name;
        }
        
        var td1 = tr.insertCell(1);
        td1.innerHTML = "<input />";
        if (value) {
            td1.firstChild.value = value;
        }
        
        var td2 = tr.insertCell(2);
        td2.innerHTML = '<input type="submit" class="button" value="Remove" />';
        $(td2.firstChild).click(function() { $(tr).remove(); });
        
        if (!(dontFocus)) {
            td0.firstChild.focus();
        }
    };
    
    this._customEnvelopeTabBody.find('.button').click(add);
    
    var count = 0;
    for (var n in env) {
        count++;
        add(true, n, JSON.stringify(env[n]));
    }
    
    if (count == 0) {
        add(true);
    }
};

CueCard.ControlPane.prototype._constructSettingsTabBody = function() {
    this._settingsTabBody.html(
        '<div><input type="checkbox"' + ($.cookie("cc_cp_clean") == "1" ? ' checked' : '') + '> Always clean up query before running</div>' +
        '<div><input type="checkbox"' + ($.cookie("cc_cp_align") == "0" ? '' : ' checked') + '> Align JSON property values with spaces</div>' +
        '<div style="display: none;"><input type="checkbox"> Try running query as you edit</div>' +
        '<div><input type="checkbox"' + ($.cookie("cc_cp_multi") == "0" ? '' : ' checked') + '> Show error messages with multiple lines on multiple lines</div>'
    );
};

CueCard.ControlPane.prototype._onCommandClick = function(evt, button, command) {
    switch (command) {
    case "redangle":
        this._redangle();
        break;
    case "qualify":
        this._qualify();
        break;
    case "generate":
        this._generateCode();
        break;
    case "one-liner":
        this._oneLiner();
        break;
    }
};

CueCard.ControlPane.prototype._redangle = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.toInsideOutQueryJson(m.context, CueCard.UI.createBlockingContinuations(function(cont, q2) {
        self._setOutputJSON(q2);
    }));
};

CueCard.ControlPane.prototype._qualify = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.qualifyAllProperties(CueCard.UI.createBlockingContinuations(
        function(cont) {
            self._setOutputJSON(q.toQueryJson({qualifyAllProperties:true}));
        }
    ));
};

CueCard.ControlPane.prototype._generateCode = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var t = CueCard.CodeGeneration.generate(q, CueCard.CodeGeneration.serializers["acre-template"], { variables: this.getVariables() });
    
    var dialog = $(
        '<div title="Generated Acre Template">' +
            '<textarea style="width: 100%; height: 100%; font-family: monospace; font-size: 12px;" wrap="off"></textarea>' +
        '</div>'
    ).appendTo(document.body);
    dialog.find("textarea")[0].value = t;
    dialog.find("textarea")[0].select();
    
    dialog.dialog({
        modal: true,
        position: "center",
        width:  800,
        height: 500,
        buttons: {
            "OK" : function() {
                dialog.dialog("close");
                dialog.remove();
            }
        }
    });
};

CueCard.ControlPane.prototype._oneLiner = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var variables = this.getVariables();
    
    var options = this.getJsonizingSettings({ variables: variables, resolveVariables: false });
    options.breakLines = false;
    
    this._options.queryEditor.content(CueCard.jsonize(q, options));
};

CueCard.ControlPane.prototype._setOutputJSON = function(o) {
    switch (this._toolsTabBody.find("input:checked")[0].value) {
    case "replace":
        this._options.queryEditor.content(CueCard.jsonize(o, this.getJsonizingSettings()));
        break;
    case "output":
        this._options.outputPane.setJSONContent(o, this.getJsonizingSettings());
        break;
    }
};

CueCard.ControlPane.prototype.getQueryEnvelopeSetting = function(name) {
    switch (name) {
    case "extended":
        return this._envelopeTabBody.find("input[name='" + this._envelopeExtendedID + "']")[0].checked ? 1 : 0;
    case "as_of_time":
        var asOfTime = this._envelopeTabBody.find("input[name='" + this._envelopeAsOfTimeID + "']")[0].value;
        if (asOfTime.length > 0) {
            return asOfTime;
        }
        break;
    }
    return null;
};

CueCard.ControlPane.prototype.getQueryEnvelope = function(e, ignorePaging) {
    e = e || {};
    
    var extended = this.getSetting("extended");
    if (extended == 1) {
        e.extended = 1;
    }
    var asOfTime = this._envelopeTabBody.find("input[name='" + this._envelopeAsOfTimeID + "']")[0].value;
    if (asOfTime.length > 0) {
        e.as_of_time = asOfTime;
    }
    var usePermissionOf = this._envelopeTabBody.find("input[name='" + this._envelopeUsePermissionOfID + "']")[0].value;
    if (usePermissionOf.length > 0) {
        e.use_permission_of = usePermissionOf;
    }
    
    var selects = this._envelopeTabBody.find("select");
    var getSelectValue = function(i) {
        return selects[i].options[selects[i].selectedIndex].value;
    };
    
    var lang = getSelectValue(0);
    if (lang.length > 0) {
        e.lang = lang;
    }
    
    var escape = getSelectValue(1);
    if (escape.length > 0) {
        e.escape = (escape == "false") ? false : escape;
    }
    
    var uniquenessFailure = getSelectValue(2);
    if (uniquenessFailure.length > 0) {
        e.uniqueness_failure = uniquenessFailure;
    }
    
    if (!(ignorePaging)) {
        var page = this._envelopeTabBody.find("input[name='" + this._envelopePageID + "']")[0].value;
        if (page.length > 0) {
            try {
                e.page = parseInt(page);
            } catch (e) {}
        }
    
        switch (this._envelopeTabBody.find("input[type='radio'][name='" + this._envelopeCursorID + "']:checked")[0].value) {
        case "true":
            e.cursor = true;
            break;
        case "custom":
            e.cursor = this._envelopeTabBody.find("input[type='text'][name='" + this._envelopeCursorID + "']")[0].value;
            break;
        }
    }
    
    this.getCustomEnvelope(e); // customize it
    
    return e;
};

CueCard.ControlPane.prototype.getCustomEnvelope = function(env) {
    env = env || {};
    
    var table = this._customEnvelopeTabBody.find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        if (name.length > 0) {
            try {
                value = JSON.parse(value);
            } catch (e) {
            }
            env[name] = value;
        }
    }
    return env;
};

CueCard.ControlPane.prototype.getSetting = function(name) {
    var checkboxes = this._settingsTabBody.find("input");
    switch (name) {
    case "cleanup" :
        var r = checkboxes[0].checked;
        $.cookie('cc_cp_clean', r ? "1" : "0", { expires: 365 });
        return r;
    case "alignJSONPropertyValues" :
        var r = checkboxes[1].checked;
        $.cookie('cc_cp_align', r ? "1" : "0", { expires: 365 });
        return r;
    case "liveQuery" :
        var r = checkboxes[2].checked;
        $.cookie('cc_cp_live', r ? "1" : "0", { expires: 365 });
        return r;
    case "multilineErrorMessages" :
        var r = checkboxes[3].checked;
        $.cookie('cc_cp_multi', r ? "1" : "0", { expires: 365 });
        return r;
    case "extended" :
        var extended = this._envelopeTabBody.find("input[name='" + this._envelopeExtendedID + "']")[0].checked ? 1 : 0;
        $.cookie('cc_cp_extended', extended, { expires: 365 });
        return extended;
    }
    return false;
};

CueCard.ControlPane.prototype.getJsonizingSettings = function(o) {
    o = o || {};
    o.indentCount = 2;
    o.alignFieldValues = this.getSetting("alignJSONPropertyValues");
    
    return o;
};

CueCard.ControlPane.prototype.getVariables = function() {
    var r = {};
    var table = this._variablesTabBody.find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        try {
            value = JSON.parse(value);
        } catch (e) {
        }
        r[name] = value;
    }
    return r;
};
