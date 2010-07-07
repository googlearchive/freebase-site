$(document).ready(function(){

    $("#schema-search > .section-tabset").tabs("#schema-search > .search-box");


/*
    $("#domain").suggest({
    "type": "/type/domain"
    }).bind("fb-select", function(e,data) { 
    var t = "#domain";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
    
    $("#user").suggest({
    "type": "/type/user"
    }).bind("fb-select", function(e,data) { 
    var t = "#user";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
    
    $("#type").suggest({
    "type" : "/type/type",
    "mql_filter" : [{
      "type" : "/type/type",
      "domain": [{
        "key": [{
          "namespace": "/"
        }]
      }],
      "a:domain": {
        "id":       "/freebase",
        "optional": "forbidden"
      }
    }]
    }).bind("fb-select", function(e,data) { 
    var t = "#type";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
    
    $("#property").suggest({
    "type" : "/type/property",
    "mql_filter" : [{
      "type": "/type/property",
      "schema": {
        "type": "/type/type",
        "domain": [{
          "key": [{
            "namespace": "/"
          }]
        }],
        "a:domain": {
          "id": "/freebase",
          "optional": "forbidden"
        }
      }
    }]
    }).bind("fb-select", function(e,data) { 
    var t = "#property";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
    
    $("#all_type").suggest({
    "type": "/type/type"
    }).bind("fb-select", function(e,data) {
    var t = "#type";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
    
    $("#all_property").suggest({
    "type": "/type/property"
    }).bind("fb-select", function(e,data) {
    var t = "#property";
    $(t).val(data.id);
    $(t + "_form").submit();
    }).focus(function() {
    this.select();
    });
*/

});