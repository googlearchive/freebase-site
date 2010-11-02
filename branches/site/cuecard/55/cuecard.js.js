CueCard.createComposition = function(options) {
    var qe = new CueCard.QueryEditor(options.queryEditorElement, options["queryEditorOptions"]);
    var op = null;
    var cp = null;
    if ("outputPaneElement" in options) {
        var opo = options["outputPaneOptions"] || {};
        opo.queryEditor = qe;
        
        op = new CueCard.OutputPane(options.outputPaneElement, opo);
        qe.setOutputPane(op);
    }
    if ("controlPaneElement" in options) {
        var cpo = options["controlPaneOptions"] || {};
        cpo.queryEditor = qe;
        if (op != null) {
            cpo.outputPane = op;
        }
        
        cp = new CueCard.ControlPane(options.controlPaneElement, cpo);
        qe.setControlPane(cp);
    }
    
    return {
        queryEditor: qe,
        outputPane: op,
        controlPane: cp
    };
};
