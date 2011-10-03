$(function() {
    module("functional", module_options);

    test("remove", function() {
      var o = $.extend({}, default_options, {type:"/music/artist"});
      test_input4.suggest(o);
      var inst = get_instance(test_input4);
      var pane = inst.pane;
      var flyout = inst.flyoutpane;
      ok(inst, "suggest initialized");
      test_input4.remove();
      ok(!pane.parent().is("body"), "suggest pane not removed");
      ok(!flyout.parent().is("body"), "suggest flyoutpane not removed");
    });

    /**
     * CLI-10009: Suggest: aborted flyout requests (from something scanned past) never re-requested
     */
    test("flyout abort (CLI-10009)", function() {
      test_input1.suggest(default_options);
      var inst = get_instance();

      stop();
      var timer = test_timeout();
      test_input1
        .bind("fb-flyoutpane-show", function() {
                clearTimeout(timer);
                ok(true, "got fb-flyoutpane-show");
                ok(inst.flyoutpane.html(), "got non-empty flyout pane");
                start();
              })
        .bind("fb-request-flyout", function(e, ajax_options) {
          console.log("fb-request-flyout", ajax_options);
          clearTimeout(inst.flyout_request.timeout);
          var id = ajax_options.data.id;
          $.suggest.flyout.cache[id] = {id:id};
          test_input1
            .unbind("fb-request-flyout")
            .trigger("textchange");
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
  });
