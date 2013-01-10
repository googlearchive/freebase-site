$(function() {
    module("ux", module_options);

    function test_select(name, onshow) {
      test("select: " + name, 2, function() {
             var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
             test_input1.suggest(o);
             var inst = get_instance();

             stop(TIMEOUT_DELAY);
             test_input1
               .bind("fb-select", function(e, data) {
                       ok(data);
                       equals(data.mid, bob_dylan_mid);
                       start();
                     })
               .bind("fb-pane-show", function() {
                       if ($(">li", inst.list).length) {
                           onshow();
                       }
                     })
               .focus()
               .val(bob_dylan_text)
               .trigger("textchange");
           });
    };

    test_select("MOUSEOVER MOUSECLICK", function() {
                  var inst = get_instance();
                  var first = $("li:first", inst.list).simulate("mouseover");
                  simulate_mouseclick(first);
                });

    test_select("MOUSEOVER ENTER", function() {
                  var inst = get_instance();
                  $("li:first", inst.list).simulate("mouseover");
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test_select("ENTER ENTER", function() {
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test_select("DOWN ENTER", function() {
                  simulate_keypress(test_input1, $.simulate.VK_DOWN);
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test_select("UP DOWN DOWN ENTER", function() {
                  simulate_keypress(test_input1, $.simulate.VK_UP);
                  simulate_keypress(test_input1, $.simulate.VK_DOWN);
                  simulate_keypress(test_input1, $.simulate.VK_DOWN);
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test_select("CTRL+UP ENTER", function() {
                  simulate_keypress(test_input1, {keyCode:$.simulate.VK_UP, ctrlKey: true});
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test_select("CTRL+DOWN DOWN DOWN ENTER", function() {
                  simulate_keypress(test_input1, {keyCode:$.simulate.VK_DOWN, ctrlKey: true});
                  simulate_keypress(test_input1, $.simulate.VK_DOWN);
                  simulate_keypress(test_input1, $.simulate.VK_DOWN);
                  simulate_keypress(test_input1, $.simulate.VK_ENTER);
                });

    test("select: flyout", 2, function() {
           var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop(TIMEOUT_DELAY);
           test_input1
             .bind("fb-select", function(e, data) {
                     ok(data);
                     equals(data.mid, bob_dylan_mid);
                     start();
                   })
             .bind("fb-flyoutpane-show", function() {
                     simulate_mouseclick(inst.flyoutpane);
                   })
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       simulate_keypress(test_input1, $.simulate.VK_DOWN);
                     }
                   })
             .focus()
             .val(bob_dylan_text)
             .trigger("textchange");
         });


    test("suggest_new: SHIFT+ENTER", 1, function() {
           var o = $.extend({}, default_options, {suggest_new:"new"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop(TIMEOUT_DELAY);
           test_input1
             .bind("fb-select-new", function(e, val) {
                     equals(val, "bob dylan");
                     start();
                   })
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       simulate_keypress(test_input1, {keyCode: $.simulate.VK_ENTER, shiftKey: true});
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });


    test("more: CLICK", 1, function() {
           var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
           test_input1.suggest(o);
           var inst = get_instance();

           var more = false,
           count = 0;

           stop(TIMEOUT_DELAY);
           test_input1
             .bind("fb-pane-show", function() {
                     if (more) {
                       ok($(">li", inst.list).length > count, "got more");
                       start();
                     }
                     else {
                       count = $(">li", inst.list).length;
                       if (count) {
                         $(".fbs-more-link", inst.pane).click();
                         more = true;
                       }
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

    test("more: CTRL+M", 1, function() {
           var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
           test_input1.suggest(o);
           var inst = get_instance();

           var more = false,
           count = 0;

           stop(TIMEOUT_DELAY);
           test_input1
             .bind("fb-pane-show", function() {
                     if (more) {
                       ok($(">li", inst.list).length > count, "got more");
                       start();
                     }
                     else {
                       count = $(">li", inst.list).length;
                       if (count) {
                         simulate_keypress(test_input1, {keyCode: 77, ctrlKey: true});
                         more = true;
                       }
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });


    test("cancel: ESC", 2, function() {
           var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop(TIMEOUT_DELAY);
           test_input1
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       ok(inst.pane.is(":visible"), "pane visible");
                       simulate_keypress(test_input1, $.simulate.VK_ESC);
                       ok(!inst.pane.is(":visible"), "pane NOT visible");
                       start();
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

  });
