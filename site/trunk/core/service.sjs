var mf = acre.require("/freebase/site/core/MANIFEST").MF;
var lib = acre.require("/freebase/libs/service/lib", mf.version["/freebase/libs/service"]);

/**
 * A generic service for json/p responses.
 *
 * Usage:
 *
 * var service = acre.require("/freebase/site/core/service").service;
 *
 * var myapis = {
 *   myservice_1: function(args, headers) {
 *     return {id:args.id};
 *   },
 *   myservice_2: function(args, headers) {
 *     return {foo:args.foo, bar:args.bar};
 *   }
 * };
 * myapis.myservice_1.args = ["id"];
 *
 * myapis.myservice_2.args = ["foo", "bar"];
 * myapis.myservice_2.auth = true;
 *
 * if (acre.current_script == acre.request.script) {
 *   service(this, myapis);
 * }
 *
 * So if you server side script (sjs) is invoked with path_info == "/myservice_2",
 * The service library will:
 * 1. Check your api dictionary (i.e., myapis) for required args for myservice_2 (i.e, ["foo", "bar"])
 * 2. Check required authentication (i.e., myservice_2 requires authentication)
 * 3. Invoke myapis.myservice_2 and /freebase/libs/service/lib to properly format/handle as json/p response.
 *
 * @see http://service.freebaseapps.com/index
 */
function main(scope, api) {
  var request = scope.acre.request;
  var method = request.method;
  var headers = request.headers;
  var action = request.path_info;

  if (action.length && action[0] === '/') {
    action = action.substring(1);
  }

  if (typeof api[action] === 'function') {
    var fn = api[action];
    var svc = (method === 'GET' ? lib.GetService :
               (headers['content-type'].indexOf("multipart/form-data") === 0 ? lib.FormService : lib.PostService));

    svc(function() {
      var args = lib.parse_request_args(fn.args); // check required args
      if (fn.auth) { // check authentication
        lib.check_user();
      }

      var response;
      if (svc === lib.FormService) {
        response = fn(args, headers, scope.acre.request.body);
      }
      else {
        response = fn(args, headers);
      }
      return response;
    }, scope);
  }
};
