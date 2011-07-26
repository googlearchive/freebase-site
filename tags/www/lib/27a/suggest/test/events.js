$(function() {
    module("events", module_options);

    test("fb-pane-show", 1, function() {
           test_input1.suggest(default_options);
           var inst = get_instance();
           stop();
           var timer = test_timeout();
           test_input1
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(timer);
                       ok(true, "got fb-pane-show");
                       start();
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

    test("fb-flyoutpane-show", 1, function() {
           test_input1.suggest(default_options);
           var inst = get_instance();

           stop();
           var timer = test_timeout();
           test_input1
             .bind("fb-flyoutpane-show", function() {
                     clearTimeout(timer);
                     ok(true, "got fb-flyoutpane-show");
                     start();
                   })
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       var first = $("li:first", inst.list).simulate("mouseover");
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

    test("fb-select", 3, function() {
           var o = $.extend({}, default_options, {filter:"(any type:/music/artist)"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var timer = test_timeout();
           test_input1
             .bind("fb-select", function(e, data) {
                     clearTimeout(timer);
                     ok(data);
                     equals(data.name, "Bob Dylan");
                     equals(data.id, bob_dylan_id);
                     start();
                   })
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       var first = $("li:first", inst.list).simulate("mouseover");
                       simulate_keypress(test_input1, $.simulate.VK_ENTER);
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

    test("fb-select-new", 1, function() {
           var o = $.extend({}, default_options, {suggest_new:"new"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var timer = test_timeout();
           test_input1
             .bind("fb-select-new", function(e, value) {
                     clearTimeout(timer);
                     equals(value, "bob dylan");
                     start();
                   })
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       $(".fbs-suggestnew", inst.pane).click();
                     }
                   })
             .focus()
             .val("bob dylan")
             .trigger("textchange");
         });

    //
    // test fb-required:
    // @see options.js
    //

    test("fb-textchange", 1, function() {
           test_input1.suggest(default_options);

           stop();
           var timer = test_timeout();
           test_input1
             .bind("fb-textchange", function() {
                     clearTimeout(timer);
                     ok(true, "got fb-textchange");
                     start();
                   })
             .focus();
           simulate_keypress(test_input1, 68);
         });
  });
