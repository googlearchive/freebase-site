/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var h = acre.require("lib/helper/helpers.sjs");
var api = acre.require("lib/promise/apis.sjs");
var deferred = api.deferred;
var freebase = api.freebase;
var urlfetch = api.urlfetch;

var util = acre.require("util.sjs");

var base_url = acre.freebase.service_url + "/api/trans/activity";


function date_str(offset) { 

  offset = offset ? offset : 0;

  var dateOffset = (24*60*60*1000) * offset;

  var date = new Date();
  date.setTime(date.getTime() + dateOffset);

  return [date.getFullYear() + '-' + (parseInt(date.getMonth())+1 < 10 ? '0' + (parseInt(date.getMonth())+1) : parseInt(date.getMonth())+1) + '-' + 
               (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()), date.toDateString(), date.getTime()];


}

var dates = function(date_offset, n_days) {
  var start_date = date_str(date_offset);
  var end_date = date_str(date_offset + n_days);

  var previous_date = date_str(date_offset-1);
  var next_date = parseInt(date_offset) < -2 ? date_str(parseInt(date_offset)+1) :['','',''];

  var dates = [];

  for (i = 0; i <= n_days; i++) { 
    dates.push(date_str(date_offset + i)[0]);
  }
  
  return {
    start: start_date,
    end: end_date,
    number: n_days-1,
    offset: date_offset,
    previous: previous_date,
    next: next_date,
    all: dates
  }
};

var activity_by_dates = function(dates) {
  var promises = [];

  promises.push(freebase.mqlread({
    "type": "/type/usergroup",
    "id":   "/en/metaweb_staff",
    "member": [{
      "id":    null,
      "limit": 500
    }]
  }));

  promises.push(freebase.mqlread({
    "type": "/type/usergroup",
    "id":   "/freebase/bots",
    "member": [{
      "id":    null,
      "limit": 500
    }]
  }));
  
  for (var i in dates) {
    var url = acre.form.build_url(base_url, {id: dates[i]});
    promises.push(urlfetch(url));
  }
  
  return deferred.all(promises)
    .then(function(r) {
      
      var a = {
        staff: {},
        bots: {},
        have_data: false,
        limited_users: {},
        data: { 
          'domains' : { 'edits' : {}, 'new' : {}},
          'types' : { 'edits' : {}, 'new' : {}},
          'users' : {'edits' : {} },
          'apps' : {'new' : {}, 'edits' : {}},
          'new' : { '/type/type' : {}, '/type/domain' : {}, '/freebase/query' : {}, '/type/user' : {} },
          'namespaces' : {'new' : [] }
        },
        edits: 0,
        acre_edits: 0,
        domain_ids: {},
        sorted_domain_ids: [],
        type_ids: {},
        sorted_app_ids: [],
        new_acre_apps: {},
        sorted_users: [],
        namespaces: {},
        new_user_ids: {},
        total_staffbots: 0, 
        total_newusers: 0,
        new_stuff: {
          '/freebase/query' : {}, 
          '/type/domain' : {}, 
          '/type/type' : {}, 
          '/type/user' : {}
        },
        totals: {
          '/type/key' : 0, 
          '/type/domain' : 0, 
          '/type/user' : 0, 
          '/freebase/query' : 0, 
          '/type/type' : 0
        },
      };
      
      var staff = r.shift().result;
      for (i in staff.member) { 
          a.staff[staff.member[i]['id']] = true;
      }
      
      var bots = r.shift().result;
      for (i in bots.member) { 
          a.bots[staff.member[i]['id']] = true;
      }
      
      
      r.forEach(function(res, i) {
        var day_data = JSON.parse(res.body);
        if (day_data && day_data[dates[i]] && day_data[dates[i]]['result']) { 
          day_data = day_data[dates[i]]['result'];

          for (var i in day_data.users.edits) { 
            if (day_data.users.edits[i] >= 9900 && !(a.staff[i] || a.bots[i])) {
              a.limited_users[i] = true;
            }
          }

          //data
          if (day_data && day_data['domains']) {
            a.have_data = true;
            util.dict_update(a.data.domains.edits, day_data.domains.edits);
            util.dict_update(a.data.domains['new'], day_data.domains['new']);
            util.dict_update(a.data.types.edits, day_data.types.edits);
            util.dict_update(a.data.types['new'], day_data.types['new']);
            util.dict_update(a.data.users.edits, day_data.users.edits);
            util.dict_update(a.data.apps.edits, day_data.apps.edits);
            util.dict_update(a.data.apps['new'], day_data.apps['new']);

            for (i in day_data['namespaces']['new']) { 
              var added = false;
              for (j in a.data['namespaces']['new']) { 

                if (day_data['namespaces']['new'][i]['id'] == a.data['namespaces']['new'][j]['id']) {
                  a.data['namespaces']['new'][j]['v'] += day_data['namespaces']['new'][i]['v'];
                  added = true;
                  break;
                }
              }

              if (!added) {
                a.data['namespaces']['new'].push({'id' : day_data['namespaces']['new'][i]['id'], 'v' : day_data['namespaces']['new'][i]['v']});
              }

            }

            for (i in a.data['new']) { 
              util.dict_update(a.data['new'][i], day_data['new'][i]);
            }
          }
        }
      });
      
      for (i in a.data['domains']['edits']) { 
        a.edits += a.data['domains']['edits'][i];
      }

      for (i in a.data['apps']['edits']) { 
        a.acre_edits += a.data['apps']['edits'][i];
      }

      //sort domains by topics added
      for (i in a.data['domains']['new']) { 
        a.domain_ids[i] = true;
      }
      for (i in a.data['domains']['edits']) { 
        a.domain_ids[i] = true;
        if (!a.data['domains']['new'][i]) { 
          a.data['domains']['new'][i] = 0; 
        }
      }
      for (i in a.domain_ids) { 
        a.sorted_domain_ids.push(i); 
      }
      a.sorted_domain_ids.sort(function(id1, id2) {
        return a.data['domains']['new'][id2] - a.data['domains']['new'][id1]; 
      });


      for (i in a.data['types']['new']) { 
        a.type_ids[i] = true;
      }
      for (i in a.data['types']['edits']) {
        a.type_ids[i] = true;
      }

      for (i in a.data['apps']['edits']) { 
        a.sorted_app_ids.push(i); 
      }
      a.sorted_app_ids.sort(function(id1, id2) { 
        return a.data['apps']['edits'][id2] - a.data['apps']['edits'][id1]; 
      });

      for (i in a.data['apps']['new']) { 
        a.new_acre_apps[a.data['apps']['new'][i]['name']] = true; 
      }

      for (i in a.data['new']['/type/user']) { 
        a.new_user_ids[a.data['new']['/type/user'][i]['user']] = true; 
      }
      
      //count staff-bots and new users who did not contribute any additional primitives          
      for (i in a.data['users']['edits']) { 
        a.sorted_users.push(i);
        if (a['staff'][i] || a['bots'][i]) { 
          a.total_staffbots +=1;
        } else if (a.data['users']['edits'][i] == 24 && a.new_user_ids[i]) { 
          a.total_newusers +=1 
        }
      }
      a.sorted_users.sort(function(id1, id2) { 
        return a.data['users']['edits'][id2] - a.data['users']['edits'][id1]; 
      });


      a.new_stuff['/type/user'] = a.data['new']['/type/user'];

      for (var i in a.data['namespaces']['new']) { 
        var root_ns = a.data['namespaces']['new'][i]['id'].slice(0, a.data['namespaces']['new'][i]['id'].slice(1).indexOf('/')+1);
        if (!a.namespaces[root_ns]) { 
          a.namespaces[root_ns] = { 'new' : [], 'total' : 0 };
        };
        a.namespaces[root_ns]['new'].push(a.data['namespaces']['new'][i]);
        a.namespaces[root_ns]['total'] += a.data['namespaces']['new'][i]['v'];
        a.totals['/type/key'] += a.data['namespaces']['new'][i]['v'];
      }

      for (i in a.data['new']['/type/domain']) { 
        var record = a.data['new']['/type/domain'][i];
        if (record.name.indexOf(' types') < 0 && !a.new_acre_apps[record.name]) {
          a.new_stuff['/type/domain'][i] = record;
          a.totals['/type/domain']++;
        }
      }

      for (i in a.data['new']['/type/type']) { 
        var record = a.data['new']['/type/type'][i];
        if (record.name != 'Topic' && record.name != 'All topics') {
          a.new_stuff['/type/type'][i] = record;
          a.totals['/type/type']++;
        }
      }

      for (i in a.data['new']['/freebase/query']) { 
        var record = a.data['new']['/freebase/query'][i];
        if (record.name != 'All topics' && !a.new_acre_apps[record.name]) {
          a.new_stuff['/freebase/query'][i] = record;
          a.totals['/freebase/query']++;
        }
      }

      a.totals['/type/user'] = a.data['types']['new']['/type/user'];
      
      return a;
    });
};

var all_freebase = function() {
  var url = acre.form.build_url(base_url, {id:'all_freebase'});
  return urlfetch(url)
    .then(function(resp) {
      var d = JSON.parse(resp.body);
      return d['all_freebase']['result']
    })
    .then(function(data) {
      var a = {
        data: data,
        graph_data: {
          topics: [], 
          primitives: []
        },
        earliest_date: null,
        date_to_ms: {},
        ms_to_date: {}
      };
      
      if (data && data['dates']) {
        a.earliest_date = data['dates']['topics'][0]['id'] > data['dates']['primitives'][0]['id'] ? data['dates']['primitives'][0]['id'] : data['dates']['topics'][0]['id']; 

        for (i = 0; i >= -5000; i--) { 
          d = date_str(i);
          a.date_to_ms[d[0]] = d;
          if (d[0] <= a.earliest_date) { break; }
        }

        for (i in a.graph_data) { 
          for (j in data['dates'][i]) { 
            var date = data['dates'][i][j]['id'];
            var v = data['dates'][i][j]['v'];
            a.graph_data[i].push([a.date_to_ms[date][2], v]);
            a.ms_to_date[a.date_to_ms[date][2]] = a.date_to_ms[date][1];
          }
        }

        //graph_data['topics'].sort(function(a,b) { return a[0] - b[0];  });
        //graph_data['primitives'].sort(function(a,b) { return a[0] - b[0];  });

        for (i in a.graph_data) { 
          for (j in a.graph_data[i]) {
            if (j > 0) { 
              a.graph_data[i][j][1] += a.graph_data[i][j-1][1];
            }

          }
        }
      }
      return a;
    });
};
