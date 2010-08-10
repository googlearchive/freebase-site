$(".summary").each(function(index) {  
    load_app_summary($(this).attr('app_id'));
});

$("#release-all").click(function(e) { 
    $(".release").each(function(index) { $(this).click(); });
    return false;
});


function load_app_summary(appid) { 
    $("#summary-" + appid).load(
	$("#summary-" + appid).attr('app_url'),
	[],
	function(text, status, req) { 
	    bind_app_buttons(appid);
	}	
    );
}


function bind_app_buttons(appid) { 

    $(".release").each(function(index) { 
	$(this).click(function(e) { 

	    html_id = $(this).attr('app_html_id');
	    
	    $.ajax({
		'url' : $(this).attr('href'),
		'data' : {'appid' : $(this).attr('app_id'), 'version' : $(this).attr('app_version') },
		'type' : 'POST',
		'dataType' : 'json',
		'success' : function(data, textStatus, req) { 
		    $("#message").html("App " + data.result.appid + " version " + data.result.release + " has been released.");
		    load_app_summary(html_id);
		},
		'beforeSend' : function(req) { 
		    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}
	    
	    });
	    
	    return false;
	});
    });
}

/*
  $(".expand").each(function(index) { 
  $(this).click(function(e) { 
  $("#details-" + $(this).attr('app_id')).show();
  $("#details-" + $(this).attr('app_id')).load($(this).attr('app_url'));
  return false;
  })})
*/

