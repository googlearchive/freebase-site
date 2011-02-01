var tids = [];

var get_cost = function(header_value, cost_key) { 
    var parts =  header_value.split(',');
    if (! parts) { 
        return '';
    }
    for (var i = 0; i < parts.length; i++) { 
        var pp = parts[i].split('='); 
        pp[0] = pp[0].replace(/^\s*/, "").replace(/\s*$/, "");
        if (pp.length > 0 && pp[0] == cost_key) { return pp[1]; } 
    }

    return '';
}

var callback = function(result) { 

    r = JSON.parse(result.body);
    console.log(result);
    
    tids.push([r['transaction_id'], get_cost(result['headers']['X-Metaweb-Cost'] || result['headers']['x-metaweb-cost'], 'dt')]);

};

var print_stats = function() { 

    tids.forEach(function (tid) { 
        url = acre.form.build_url('http://stats.metaweb.com/query/transaction', { 'tid' : tid[0] });
        acre.write('<br/><a href="' + url + '">' + tid[0] + '</a> (' + tid[1] + ' secs as reported by dt in x-metaweb-cost)\n'); }
     );

}