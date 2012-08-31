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
   
(function($, fb) {
        
    $(function () {       

        // Domain suggest
        $("#review-search").suggest({filter:'(all type:/type/domain)'});
        $("#review-search").bind("fb-select", function(e, data) {                       
            window.location.href = fb.h.fb_url("/review?", "domain=" + data.id);
        });

        // Active Flags in last x days
        var i = 0;
        var activeFlags = fb.c.activeFlags.map(function(value){
            var date = new Date();
            date.setDate(date.getDate() - i++);          
            return [date, value];
        });

        // Active Judgments in last x days
        var i = 0;
        var activeJudgments = fb.c.activeJudgments.map(function(value){
            var date = new Date();
            date.setDate(date.getDate() - i++);          
            return [date, value];
        });

        var flot_options = {
            xaxis: {
                mode: "time", 
                label: "date"                                                                      
            },
            yaxes: [
                { label: "Count" },
                { position: "left", label: "Count" }
            ],                
            grid: {
                hoverable: true, 
                clickable: true
            },
            series: {
                points: {show: true},
                lines:  {show: true}
            },                
            legend: {
                show: true,
                position: "se"
            }
        }

        var placeholder = $("#placeholder");
        $.plot(placeholder, 
            [ 
                {data: activeFlags, label:"Number of flags" }, 
                {data: activeJudgments, label:"Number of judgments", yaxis:2}
            ], flot_options
        );

        function showTooltip(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css( {
                position: 'absolute',
                display: 'none',
                top: y - 35,
                left: x + 5,
                border: '1px solid #fdd',
                padding: '2px',
                'background-color': '#fee',
                opacity: 0.80
            }).appendTo("body").fadeIn(200);
        }        
        var previousPoint = null;
        function evaluateTooltip(event, pos, item) {           
            $("#x").text(pos.x.toFixed(2));
            $("#y").text(pos.y.toFixed(2));
            if (item) {
                if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;
                    $("#tooltip").remove();
                    var x = new Date(item.datapoint[0]);
                    var y = item.datapoint[1].toFixed(0);
                    showTooltip(item.pageX, item.pageY, x.toDateString() + " : " + y);
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        }

        $("#placeholder-flags").bind("plothover", evaluateTooltip);        

    }); 

})(jQuery, window.freebase);
