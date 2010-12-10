CueCard.ExampleDialog = function(options) {
    this._options = options || {};
    this._constructUI();
};

CueCard.ExampleDialog._dialog = null;

CueCard.ExampleDialog.prototype.dispose = function() {
    // TODO
};

CueCard.ExampleDialog.prototype._constructUI = function() {
    if (CueCard.ExampleDialog._dialog == null) {
        CueCard.ExampleDialog._dialog = $(
            '<div id="cuecard-examples-dialog" title="Examples">' +
                '<div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-0">Techniques</div>' +
                '<div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-1">Examples</div>' +
                '<div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-2">Query</div>' +
                
                '<div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-0"></div>' +
                '<div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-1"></div>' +
                '<textarea class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-2 cuecard-examples-query" readonly="true" wrap="off" />' +
            '</div>'
        ).appendTo(document.body);
        
        var textarea = CueCard.ExampleDialog._dialog.find("textarea")[0];
        var tds = CueCard.ExampleDialog._dialog.find(".cuecard-examples-dialog-columnBody");
        var resize = function() {
            var margin = 10;
            var spacing = 5;
            
            var dialogBody = $("#cuecard-examples-dialog")[0];
            var height = dialogBody.offsetHeight - 35;
            tds.css("top", "30px").css("height", height + "px");
            
            var column0Width = 200;
            var sizableWidth = (dialogBody.offsetWidth - 2 * margin - 2 * spacing) - column0Width;
            var column1Width = Math.round(sizableWidth * 0.5);
            var column2Width = Math.round(sizableWidth * 0.5);
            $(".cuecard-examples-dialog-column-0").css("left", margin + "px").css("width", column0Width + "px");
            $(".cuecard-examples-dialog-column-1").css("left", (margin + column0Width + spacing) + "px").css("width", column1Width + "px");
            $(".cuecard-examples-dialog-column-2").css("left", (margin + column0Width + column1Width + 2 * spacing) + "px").css("width", column2Width + "px");
        };
        
        var techniqueMap = { "all" : [] };
        var resetExampleSelection = function() {
            CueCard.ExampleDialog._dialog.find(".cuecard-examples-example").removeClass("cuecard-examples-example-selected");
        };
        var selectExample = function(elmt, index) {
            resetExampleSelection();
            $(elmt).addClass("cuecard-examples-example-selected");
            
            textarea.value = CueCard.jsonize(CueCard.Examples[index].query, { indentCount: 2 });
        };
        var handleExample = function(index, example) {
            $('<a href="javascript:{}" class="cuecard-examples-example" id="cuecard-example-' + index + '">' + example.name + '</a>')
                .click(function() { selectExample(this, index); })
                .appendTo(tds[1]);
                
            for (var x = 0; x < example.techniques.length; x++) {
                var technique = example.techniques[x];
                if (technique in techniqueMap) {
                    techniqueMap[technique].push(index);
                } else {
                    techniqueMap[technique] = [ index ];
                }
            }
        };
        CueCard.Examples.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        for (var i = 0; i < CueCard.Examples.length; i++) {
            handleExample(i, CueCard.Examples[i]);
        }
        
        var selectTechnique = function(elmt, technique) {
            CueCard.ExampleDialog._dialog.find(".cuecard-examples-technique").removeClass("cuecard-examples-technique-selected");
            $(elmt).addClass("cuecard-examples-technique-selected");
            
            if (technique == "all") {
                CueCard.ExampleDialog._dialog.find(".cuecard-examples-example").show();
            } else {
                CueCard.ExampleDialog._dialog.find(".cuecard-examples-example").hide();
                
                var indices = techniqueMap[technique];
                for (var i = 0; i < indices.length; i++) {
                    $("#cuecard-example-" + indices[i]).show();
                }
            }
            
            resetExampleSelection();
            textarea.value = "";
        };
        var handleTechnique = function(technique) {
            $('<a href="javascript:{}" class="cuecard-examples-technique' + (technique == "all" ? " cuecard-examples-technique-selected" : "") + '">' + 
                technique + 
                ' (' + (technique == "all" ? CueCard.Examples.length : techniqueMap[technique].length) + ')</a>'
            )
                .click(function() { selectTechnique(this, technique); })
                .appendTo(tds[0]);
        };
        for (var i = 0; i < CueCard.ExampleTechniques.length; i++) {
            handleTechnique(CueCard.ExampleTechniques[i]);
        }
        
        
        CueCard.ExampleDialog._dialog.dialog({
            autoOpen: false,
            modal: true,
            resizable: true,
            position: "center",
            minWidth: 800,
            minHeight: 300,
            resize: resize,
            open: resize
        });
    }
    
    var self = this;
    CueCard.ExampleDialog._dialog.dialog(
        'option',
        'width',
        $(window).width() - 150
    ).dialog(
        'option',
        'height',
        $(window).height() - 200
    ).dialog(
        'option', 
        'buttons', 
        {
            "Paste & Run" : function() {
                $(this).dialog("close");
                self._options.onDone(CueCard.ExampleDialog._dialog.find("textarea")[0].value);
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        }
    );
    CueCard.ExampleDialog._dialog.dialog("open");
};
