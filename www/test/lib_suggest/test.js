var test_input1;
var test_input2;
var test_input3;
var test_input4;

// The timeout delay (in ms) for a suggest test to finish.
var TIMEOUT_DELAY = 5000;

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
  key: "AIzaSyBij3tRJN2VdWiLQN48-BmPFjNWpHe7MQE",
  advanced: true
};
var test_value = "bob dyla";
var bob_dylan_mid = "/m/01vrncs";
var bob_dylan_text = "Bob Dylan";

var position_threshold = 10;

function get_instance(input) {
  input = input || test_input1;
  return input.data("suggest");
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


function test_suggest_result(options, prefix, expected, on_empty) {
  var o = $.extend({}, default_options, options);
  test_input1.suggest(o);
  var inst = get_instance();

  stop(TIMEOUT_DELAY);
  test_input1
    .bind("fb-pane-show",
          function() {
            var found = false;
            var compare_expected;
            if (typeof expected === "function") {
              compare_expected = function(data) {
                return expected(data);
              };
            }
            else {
              compare_expected = function(data) {
                return data.mid === expected || data.id === expected;
              };
            }
            var list = $(">li", inst.list);
            if (list.length) {
              list.each(function() {
                  var data = $(this).data("data.suggest");
                  found = compare_expected(data);
                  if (found) {
                    return false;
                  }
              });
              ok(found);
              start();
            }
            else if (on_empty) {
              ok(on_empty());
              start();
            }
          })
    .val(prefix).trigger("textchange");
};
