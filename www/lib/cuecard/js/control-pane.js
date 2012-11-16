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

CueCard.ControlPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._constructUI();
};

CueCard.ControlPane.prototype.dispose = function() {
    // TODO
};

CueCard.ControlPane.prototype._constructUI = function() {
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    this._elmt.acre(fb.acre.current_script.app.path + "/cuecard/mjt/control-pane.mjt", "tabs", [idPrefix, this]);
    $('#' + idPrefix + " > .section-tabset").tabs('#' + idPrefix + " > .tabbed-content > .cuecard-controlPane-tabBody", { initialIndex: 0 });

    if (this._options.paneldrawer) {
      this._paneldrawer = this._options.paneldrawer.element.paneldrawer(this._options.paneldrawer).data("$.paneldrawer");
      this._paneldrawer.drawer_toggle.show();
    }
};

CueCard.ControlPane.prototype.layout = function(height, width) {
  // Assumes fixed size
};

CueCard.ControlPane.prototype._getDefaults = function() {
    var opts = this._options;
    var env = opts.env || {};
    
    var defaults = {};
    
    defaults.extended = opts.extended || env.extended;
    defaults.extended = (defaults.extended === 1) ? true : false;
    defaults.as_of_time = opts.as_of_time || env.as_of_time || null;
    defaults.use_permission_of = opts.use_permission_of || env.use_permission_of || null;
    defaults.costs = opts.costs || false;
    
    delete env["extended"];
    delete env["as_of_time"];
    delete env["use_permission_of"];
    delete env["costs"];
    
    return defaults;
};

CueCard.ControlPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
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
    
    CueCard.showDialog("acre_template", t);
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
    switch (this._getTab("tools").find("input[name='tools-result']:checked").val()) {
        case "replace":
            this._options.queryEditor.content(CueCard.jsonize(o, this.getJsonizingSettings()));
            break;
        case "output":
            this._options.outputPane.setJSONContent(o, this.getJsonizingSettings());
            break;
        }
};

CueCard.ControlPane.prototype._runPage = function(increment) {
    var input = this._getTab("envelope").find("input[name='page']");
    var pageString = input.val();
    var page = parseInt(pageString) || 1;
    page += increment;

    if (page < 1) {
        input.val("1");
        return;
    } else {
        input.val(page);
        if (this._options.queryEditor != null) {
            this._options.queryEditor.run();
        }
    }
};

CueCard.ControlPane.prototype._runCursor = function(auto_run) {
    if (this._options.outputPane != null) {
        var o = this._options.outputPane.getJson();
        if (o !== undefined && o !== null && "cursor" in o) {
            this._getTab("envelope").find("input[name='cursor']").val(o.cursor);
            this._getTab("envelope").find("input[name='cursor-opt'][value='custom']").attr("checked", "checked");

            if (this._options.queryEditor != null && auto_run) {
                this._options.queryEditor.run();
            }
        }
    }
};

CueCard.ControlPane.prototype.getQueryEnvelopeSetting = function(name) {
    switch (name) {
        case "extended":
            return this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
        case "as_of_time":
            var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
            if (asOfTime.length > 0) {
                return asOfTime;
            }
            break;
    }
    return null;
};

CueCard.ControlPane.prototype.getQueryEnvelope = function(e, ignorePaging, ignoreLanguage) {
    e = e || {};
    
    var extended = this.getSetting("extended");
    if (extended == 1) {
        e.extended = 1;
    }
    
    var showCosts = this.getSetting("costs");
    if (showCosts) {
      e.cost = true;
    }
    
    var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
    if (asOfTime.length > 0) {
        e.as_of_time = asOfTime;
    }
    var usePermissionOf = this._getTab("envelope").find("input[name='use_permission_of']").val();
    if (usePermissionOf.length > 0) {
        e.use_permission_of = usePermissionOf;
    }
    
    var selects = this._getTab("envelope").find("select");
    var getSelectValue = function(i) {
        return selects[i].options[selects[i].selectedIndex].value;
    };
    
    if (!ignoreLanguage) {
      var lang = getSelectValue(0);
      if (lang.length > 0) {
          e.lang = lang;
      }      
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
        var page = this._getTab("envelope").find("input[name='page']").val();
        if (page.length > 0) {
            try {
                e.page = parseInt(page);
            } catch (e) {}
        }
    
        switch (this._getTab("envelope").find("input[name='cursor-opt']:checked").val()) {
            case "true":
                e.cursor = true;
                break;
            case "custom":
                e.cursor = this._getTab("envelope").find("input[name='cursor']").val();
                break;
            }
    }
    
    this.getCustomEnvelope(e); // customize it
    
    return e;
};

CueCard.ControlPane.prototype.getCustomEnvelope = function(env) {
    env = env || {};
    
    var table = this._getTab("envelope").find('table.cuecard-controlPane-customEnvelope')[0];
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
    var checkboxes = this._getTab("tools").find("input");
    switch (name) {
        case "cleanup" :
            var r = checkboxes[0].checked;
            $.localstore('cc_cp_clean', r ? "1" : "0", false);
            return r;
        case "alignJSONPropertyValues" :
            var r = checkboxes[1].checked;
            $.localstore('cc_cp_align', r ? "1" : "0", false);
            return r;
        case "liveQuery" :
            var r = checkboxes[2].checked;
            $.localstore('cc_cp_live', r ? "1" : "0", false);
            return r;
        case "multilineErrorMessages" :
            var r = checkboxes[3].checked;
            $.localstore('cc_cp_multi', r ? "1" : "0", false);
            return r;
        case "extended" :
            var extended = this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
            $.localstore('cc_cp_extended', extended, false);
            return extended;
        case "costs" :
            var costs = this._getTab("envelope").find("input[name='costs']").attr("checked") ? 1 : 0;
            $.localstore('cc_cp_costs', costs, false);
            return costs;
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
    var table = this._getTab("variables").find('table')[0];
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

CueCard.ControlPane.prototype._removeRow = function(elm, sel, add_row) {
    var table = elm.closest('table');
    elm.closest(sel).remove();
    if ($(sel).length < 1) {
        table.append($.acre(add_row()));
    }
};
