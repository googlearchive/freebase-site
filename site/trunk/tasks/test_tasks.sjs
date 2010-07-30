acre.require('/test/lib').enable(this);
var tasks = acre.require("routes");

test("test _getParams", function(){
       var params = tasks._get_params("/12345");
       equals(params.length, 1, "param length should be 1.");
       equals(params[0][0], "task");
       equals(params[0][1], "12345");

       params = tasks._get_params("/12346/projects/7890");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "12346");
       equals(params[1][0], "projects");
       equals(params[1][1], "7890");

       params = tasks._get_params("/12346/projects/");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "12346");
       equals(params[1][0], "projects");
       equals(params[1][1], null);

       params = tasks._get_params("/12346/projects");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "12346");
       equals(params[1][0], "projects");
       equals(params[1][1], null);
       
});

acre.test.report();
