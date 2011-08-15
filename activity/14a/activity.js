$(function () {
  
  $("#hide_staff")
    .click(function(e) { 
      $(".staff-bots").hide(); return false; 
    });
  
      
   for (i in graph_data) {
     
     var plot = $.plot($("#placeholder-" + i), [{ data: graph_data[i] }],
       {
         series: {
           color: '#ff7711',
           lines: { show: true },
          shadowSize: 0
         },
         grid: {
           show: false,
           color: "#666",
           borderWidth: 0,
           hoverable: true,
           autoHighlight: true,
           mouseActiveRadius: 3
         },
         xaxis: { mode: "time" }
       }
     );
   }
   
   function showTooltip(x, y, contents) {
     $('<div id="tooltip">' + contents + '</div>').css( {
       position: 'absolute',
       display: 'none',
       top: y + 5,
       left: x + 5,
       border: '1px solid #fdd',
       padding: '2px',
       'background-color': '#fee',
       opacity: 0.80
     }).appendTo("body").fadeIn(200);
   }
   
   var previousPoint = null;
   
   var evaluateTooltip = function(event, pos, item) {
     $("#x").text(pos.x);
     $("#y").text(pos.y);
     
     if (item) {
       if (previousPoint != item.datapoint) {
         previousPoint = item.datapoint;
         
         $("#tooltip").remove();
         var x = ms_to_date[parseInt(item.datapoint[0])],
             y = parseInt(item.datapoint[1]);
         
         showTooltip(item.pageX, item.pageY,
                     x + ": " + y);
       }
     }
     else {
       $("#tooltip").remove();
       previousPoint = null;            
     }
     
   }
       
   $("#placeholder-new").bind("plothover", evaluateTooltip);
   $("#placeholder-edits").bind("plothover", evaluateTooltip);  
   
});
