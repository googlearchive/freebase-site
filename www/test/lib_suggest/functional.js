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

      stop(TIMEOUT_DELAY);
      var first;
      test_input1
        .bind("fb-flyoutpane-show", function() {
                ok(true, "got fb-flyoutpane-show");
                ok(inst.flyoutpane.html(), "got non-empty flyout pane");
                start();
              })
        .bind("fb-request-flyout", function(e, ajax_options) {
          clearTimeout(inst.flyout_request.timeout);
          var id = first.data("data.suggest").id;
          //var id = ajax_options.data.id;
          $.suggest.flyout.cache[id] = {id:id};

          test_input1
            .unbind("fb-request-flyout")
            .trigger("textchange");
        })
        .bind("fb-pane-show", function() {
                if ($(">li", inst.list).length) {
                  first = $("li:first", inst.list);
                  first.simulate("mouseover");
                }
              })
        .focus()
        .val("bob dylan")
        .trigger("textchange");

    });

    /**
     * SITE-1264
     */
    test("id prefix (/people/pers)", function() {
      test_suggest_result(null, "/people/pers", "/people/person");
    });

    test("mid (/m/03_x5t)", function() {
      test_suggest_result(null, "/m/03_x5t", "/m/03_x5t");
    });

    test("id (/en/barack_obama)", function() {
      test_suggest_result(null, "/en/barack_obama", "/m/02mjmr");
    });

    test("id (/film/film)", function() {
      test_suggest_result(null, "/film/film", "/film/film");
    });

  });
