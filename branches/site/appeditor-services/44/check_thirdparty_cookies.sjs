var service = acre.require('lib_appeditor_service');

if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args();        

        if (!args.test) {
            var rand = Math.floor(1000000 * Math.random());
            acre.response.set_cookie('test', rand);

            var url = acre.request.base_path + "/" + acre.current_script.name + '?test=1&cookie=' + rand + '&callback=' + args.callback;
            acre.response.status = 302;
            acre.response.set_header('location', url);
        } else {
            acre.response.clear_cookie('test');
            
            if (parseInt(args.cookie) === parseInt(acre.request.cookies['test'])) {
                return "success";
            } else {
                throw "fail";
            }
        }

    }, this);
}
