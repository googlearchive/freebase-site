var test_input1;
var test_input2;
var test_input3;
var test_input4;

$(function() {
    test_input1 = $("#test1");
    test_input2 = $("#test2");
    test_input3 = $("#test3");
    test_input4 = $("#test4");
  });


var module_options = {
  setup: function() {
  },
  teardown: function() {
    $.suggest.cache = {};
    if ($.suggest.flyout) {
      $.suggest.flyout.cache = {};
    }
    $.each([test_input1, test_input2, test_input3, test_input4], function(i,n) {
             n.unbind();
             var inst = get_instance(n);
             if (inst) {
               inst._destroy();
             }
             n.val("");
           });
  }
};

var default_options = {
  service_path: "/freebase/v1-sandbox/search",
  key: "AIzaSyBk_TTTJQ_QaBKP1SmwzOb5-YwXQwmBOOA"
};
var test_value = "bob dyla";
var bob_dylan_id = "/m/01vrncs";

var position_threshold = 10;

function get_instance(input) {
  input = input || test_input1;
  return input.data("suggest");
};

function test_timeout(delay) {
  return setTimeout(function() {
                      ok(false, "test_timeout");
                      start();
                    }, 10000);
};


function simulate_keypress(elt, keyCode) {
  var options = keyCode;
  if (typeof options !== "object") {
    options = {keyCode:options};
  }
  elt.simulate("keydown", options);
  elt.simulate("keyup", options);
  elt.simulate("keypress", options);
};


function simulate_mouseclick(elt) {
  elt.simulate("mousedown")
    .simulate("mouseup")
    .simulate("mouseclick")
    .click();
};
