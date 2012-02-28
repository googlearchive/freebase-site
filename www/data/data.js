
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

  var data = fb.data = {

    // initialize tabset for toggling between
    // synthetic views and user-created views
    init_data_tabs: function(context) {
      var tabset = $("ul.tabs");
      var initial_index = 0;

      $("a", tabset).each(function(i) {
        if($(this).hasClass("current")) {
          initial_index = i;
        }
      });

      tabset.tabs("div.panes > .pane", {
        effect: 'fade',
        initialIndex: initial_index
      });
    },

    init_activity_chart: function(context) {
      $(".activity-summary", context).each(function() {

        // the DOM element we'll be attaching the graph to
        var $chart = $(this);

        // the activity data is stored as attribute
        var weeks = JSON.parse($chart.attr("data-activity"));

        var x = [], edits = [];
        for (var i=1; i < weeks.length; i++) {
          var edit = parseInt(weeks[i].v, 10);
          edits.push([i, edit]);
        }

        var options = {
          grid: {
            show: true,
            color: "#fff",
            borderWidth: 0,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 3
          },
          legend: {show: false},
          xaxis: {
            tickFormatter: function() {return "";},
            ticks: []
          },
          yaxis: {
            tickFormatter: function() {return "";},
            ticks: []
          }
        };

        var series = {
          data: edits,
          lines: {
            show: true
          },
          points: {
            show: true,
            radius: 2,
            fill: true,
            fillColor: "#f71"
          },
          shadowSize: 0,
          color: "#f71"
        };
        $.plot($chart, [series], options);
      });
    }
  };

  function init() {
    data.init_data_tabs();
    data.init_activity_chart();
  };

  $(init);

})(jQuery, window.freebase);
