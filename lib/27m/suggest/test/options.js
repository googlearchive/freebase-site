$(function() {
    module("options", module_options);

    function test_css(css) {
      var inst = get_instance();
      ok(inst.pane.hasClass(css.pane), "css.pane");
      ok(inst.status.hasClass(css.status), "css.status");
      ok(inst.list.hasClass(css.list), "css.list");
      ok(inst.flyoutpane.hasClass(css.flyoutpane), "css.flyoutpane");

      stop();
      var t = test_timeout();
      test_input1
        .bind("fb-pane-show",
              function() {
                if ($(">li", inst.list).length) {
                  clearTimeout(t);
                  $(">li", inst.list)
                    .each(function() {
                            $(this).hasClass(css.item);
                            var name = $("."+css.item_name, this);
                            equals(name.length, 1);
                            var type = $("."+css.item_type, name);
                            equals(type.length, 1);
                          });
                  start();
                }
              })
        .val("css").trigger("textchange");
    };

    test("css_prefix", function() {
           var o = $.extend({}, default_options, {css_prefix:"test-"});
           test_input1.suggest(o);
           var css = {};
           var defaults = $.extend(true, {}, $.suggest.defaults.css, $.suggest.suggest.defaults.css);
           $.each(defaults,
                  function(k,v) {
                    css[k] = "test-" + v;
                  });
           test_css(css);
         });

    test("css", function() {
           var css =  {
             pane: "my-pane",
             list: "my-list",
             item: "my-item",
             item_name: "my-item-name",
             selected: "my-selected",
             status: "my-status",
             item_type: "my-item-type",
             flyoutpane: "my-flyout-pane"
           };
           var o = $.extend({}, default_options, {css:css});
           test_input1.suggest(o);
           test_css(css);
         });

    test("parent", 1, function() {
           var parent = $('<div id="parent">');
           $(document.body).append(parent);
           var o =  $.extend({}, default_options, {parent:"#parent"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       equals(inst.pane.parent()[0], parent[0]);
                       start();
                     }
                   })
             .val("bob dyl").trigger("textchange");
         });

    test("flyout_parent", 1, function() {
           var parent = $('<div id="flyout_parent">');
           $(document.body).append(parent);
           var o = $.extend({}, default_options, {flyout_parent:"#flyout_parent"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     $("li:first", inst.list).trigger("mouseover");
                   })
             .bind("fb-flyoutpane-show",
                   function() {
                     clearTimeout(t);
                     equals(inst.flyoutpane.parent()[0], parent[0]);
                     start();
                   })
             .val("stephen colb").trigger("textchange");
         });

    test("status[0]", 1, function() {
           var o = $.extend({}, default_options, {status:["0","1","2","3"]});
           test_input1.suggest(o);
           var inst = get_instance();

           test_input1.val("").trigger("textchange");
           equals(inst.status.text(), "0");
         });

    test("status[1]", 1, function() {
           var o = $.extend({}, default_options, {status:["0","1","2","3"]});
           test_input1.suggest(o);
           var inst = get_instance();

           test_input1.val("obama").trigger("textchange");
           equals(inst.status.text(), "1");
         });

    test("status[2]", 1, function() {
           var o = $.extend({}, default_options, {status:["0","1","2","3"]});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show", function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       equals(inst.status.text(), "2");
                       start();
                     }
                   })
             .val("hillary cli").trigger("textchange");
         });

    test("status[3]", 1, function() {
           var o = $.extend({}, default_options, {status:["0","1","2","3"]});
           test_input1.suggest(o);
           var inst = get_instance();

           inst.status_error();
           equals(inst.status.text(), "3");
         });

    test("required=true", 1, function() {
           var o = $.extend({}, default_options, {required:true});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-required", function() {
                     clearTimeout(t);
                     ok(true);
                     start();
                   })
             .val("sakuragi hana").trigger("textchange");
           inst.blur();
         });

    test("required=always", 1, function() {
           var o = $.extend({}, default_options, {required:"always"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-required", function() {
                     clearTimeout(t);
                     ok(true);
                     start();
                   })
             .val("").trigger("textchange");
           inst.blur();
         });

    test("zIndex", 1, function() {
           var o = $.extend({}, default_options, {zIndex:1000});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show", function() {
                     clearTimeout(t);
                     equals(inst.pane.css("z-index"), 1000);
                     start();
                   })
             .val("shohoku").trigger("textchange");
         });

    test("flyout=false", 1, function() {
           var o = $.extend({}, default_options, {flyout:false});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       $("li:first", inst.list).trigger("mouseover");
                       t = setTimeout(function() {
                                        ok(true, "flyout not shown");
                                        start();
                                      }, 5000);
                     }
                   })
             .bind("fb-flyoutpane-show",
                   function() {
                     clearTimeout(t);
                     fail("flyout shown when flyout=false");
                     start();
                   })
             .val("avatar").trigger("textchange");
         });

    test("flyout=bottom", 1, function() {
           var o = $.extend({}, default_options, {flyout:"bottom"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     $("li:first", inst.list).trigger("mouseover");
                   })
             .bind("fb-flyoutpane-show",
                   function() {
                     clearTimeout(t);
                     var pane = inst.pane.offset();
                     var flyout = inst.flyoutpane.offset();
                     ok(Math.abs(flyout.top - (pane.top + inst.pane.height())) < position_threshold);
                     start();
                   })
             .val("avatar").trigger("textchange");
         });

    test("align=left", 1, function() {
           var o = $.extend({}, default_options, {align:"left"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       ok(Math.abs(inst.pane.offset().left - test_input1.offset().left) < position_threshold);
                       start();
                     }
                   })
             .val("lady ga").trigger("textchange");
         });

    test("align=right", 1, function() {
           var o = $.extend({}, default_options, {align:"right"});
           test_input3.suggest(o);
           var inst = get_instance(test_input3);

           stop();
           var t = test_timeout();
           test_input3
             .bind("fb-pane-show",
                   function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       var pane_right = inst.pane.offset().left + inst.pane.width();
                       var input_right = test_input3.offset().left + test_input3.width();
                       ok(Math.abs(pane_right - input_right) < position_threshold);
                       start();
                     }
                   })
             .val("jessica alb").trigger("textchange");
         });


    test("suggest_new", 1, function() {
           var o = $.extend({}, default_options, {suggest_new: "suggest_new"});
           test_input1.suggest(o);
           var inst = get_instance();

           stop();
           var t = test_timeout();
           test_input1
             .bind("fb-pane-show",
                   function() {
                     if ($(">li", inst.list).length) {
                       clearTimeout(t);
                       equals($("button:first", inst.pane).text(), "suggest_new");
                       start();
                     }
                   })
             .val("aplusk").trigger("textchange");
         });


    function test_suggest_result(options, prefix, expected) {
      var o = $.extend({}, default_options, options);
      test_input1.suggest(o);
      var inst = get_instance();

      stop();
      var t = test_timeout();
      test_input1
        .bind("fb-pane-show",
              function() {
                if ($(">li", inst.list).length) {
                  clearTimeout(t);
                  var name = $("li:first .fbs-item-name label", inst.list).text();
                  if (typeof expected === "function") {
                    ok(expected(name));
                  }
                  else {
                    equals(name, expected);
                  }
                  start();
                }
              })
        .val(prefix).trigger("textchange");
    };

    var filters = [
      "(any type:/music/artist)",
      "(any type:/people/person type:/music/artist)",
      "(all type:/music/artist)",
      "(all type:/people/person type:/music/artist)",
      "(should type:/music/artist)",
      "(should type:/people/person)"
    ];

    $.each(filters, function(i, filter) {
      test("filter=" + filter, 1, function() {
        test_suggest_result({filter: filter}, "bob dylan", "Bob Dylan");
      });
    });

    $.each([[{"/film/film/directed_by": "Steven Spielberg"}], JSON.stringify([{"/film/film/directed_by": "Steven Spielberg"}])],
           function(i,n) {
             var name = n;
             if (typeof n !== "string") {
               n = JSON.stringify(n);
             }
             test("mql_filter=" + n, 1, function() {
                    test_suggest_result({filter:"(any type:/film/film)", mql_filter:n},"saving", "Saving Private Ryan");
                  });
           });

    test("as_of_time=2008", 1, function() {
           test_suggest_result({filter:"(any type:/music/artist)", as_of_time:2008},"lady gaga", function(name) {
                                 return name != "Lady Gaga";
                               });
         });
    test("as_of_time=2010", 1, function() {
           test_suggest_result({filter:"(any type:/music/artist)", as_of_time:2010},"lady gaga", "Lady Gaga");
         });
  });

