/**
* Add es5 features
*/
Object.create = Object.create || function(p) {
  if (arguments.length != 1)
    throw new Error("Can't simulate 2nd arg");
  function f() {}; // Crockford's trick
  f.prototype = p;
  return new f();
};

Object.keys = Object.keys || function(o) {
  var result = [];
  for(var name in o) {
    if (o.hasOwnProperty(name))
      result.push(name);
  }
  return result;
};

Function.prototype.bind = Function.prototype.bind || function(scope) {
  var func = this;
  return function() {
    return func.apply(scope, arguments);
  };
};


/**
*  Convert all errors in deferreds into a standard object
*/
function wrap_deferred_error(e) {
    if (!e) e = {};
    
    if (e instanceof Error) {
        e.code = e.code || "/internal/javascript";
        e.message = e.message || e.toString();
        e.info = e.info || null;
    } else {
        e.code = e.toString() || "/internal";
        e.message = e.toString();
        e.info = null;
    }
    return e;
}


/**
*  A Task that supports callback/errback chaining
*/
var Deferred = acre.task.define(null, []);

Deferred.prototype.request = function() {
    // Any Tasks based on Deferred need this to be the last line in request()
    this.runCallstack();
};

Deferred.prototype._add_error = function(e) {
    if (!this.messages)
        this.messages = null;
        
    if (typeof e !== 'undefined') {
        var error = wrap_deferred_error(e);
        console.error(error.message, error);
        this.messages = error;
    }
    
    this.not_in_error = false;
}

Deferred.prototype.callback = function(data) {
    this.result = data;
    this.messages = null;
    return this.enqueue();
};

Deferred.prototype.errback = function(e) {
    this.result = null;
    this._add_error(e);
    return this.enqueue();
};

Deferred.prototype._add_call = function(call_state) {
    if (!this.callstack) {
        this.callstack = [];
    }
    
    this.callstack.push(call_state);
    
    if (this.state === "error" || this.state === "ready") {
        this.runCallstack();
    }
    
    return this;
};

Deferred.prototype.addCallback = function(func) {
    var call_state = {
        kind: "callback",
        func: func,
        args: Array.prototype.slice.call(arguments, 1)
    };
    
    return this._add_call(call_state);
};

Deferred.prototype.addErrback = function(func) {
    var call_state = {
        kind: "errback",
        func: func,
        args: Array.prototype.slice.call(arguments, 1)
    };
    
    return this._add_call(call_state);
};

Deferred.prototype.addBoth = function(func, opts) {
    var call_state = {
        kind: "both",
        func: func,
        args: Array.prototype.slice.call(arguments).slice(1)
    };
    
    return this._add_call(call_state);
};

Deferred.prototype._run_call = function(cb) {
    try {
        var result;
        var args = cb.args.slice(0);
        
        if (cb.kind !== "errback") {
            // Place the result as the first argument
            args.unshift(this.result);
            result = cb.func.apply(this, args);
        } else {
            // Place the error as the first argument
            args.unshift(this.messages);
            result = cb.func.apply(this, args);
            this.not_in_error = true;
        }
        
        if (result instanceof Deferred) {
            // If returned a deferred then add it to the chain
            var self = this;
            result.addCallback(function(data) {
                self.result = data;
                self.runCallstack();
            });
            result.addErrback(function(e) {
                self._add_error(e);
                self.runCallstack();
            });
        } else {
            // Otherwise continue down the chain
            this.result = result;
            return this.runCallstack();
        }
    } catch(e) {
        this._add_error(e);
        return this.runCallstack();
    }
    return this;
}

Deferred.prototype.runCallstack = function() {
    if  (typeof this.not_in_error === 'undefined') {
        this.not_in_error = true;
    }
    
    if (!this.callstack || !this.callstack.length) {
        if (this.state === "wait") {
            // Set the deferred to be ready to
            //  to take callbacks and errbacks
            this.ready(this.result);
        }
        return this;
    }
    
    // Grab the next call state off of the call stack and run it
    var cb = this.callstack.shift();
    
    // callback is the wrong type, so skip
    if ((cb.kind !== "both") &&
            !(this.not_in_error && (cb.kind === "callback")) && 
            !(!this.not_in_error && (cb.kind === "errback"))) {
        return this.runCallstack();
    }
    
    return this._run_call(cb);
};



/**
*  Internal Only -- Underlying Task used for grouping deferreds
*     NOTE: Most of this is lifted directly from mjt.Task
*/
var DeferredGroup = acre.task.define(Deferred, [
  {name: "dgroup"}, 
  {name: "opts", 'default':{}}
]);

DeferredGroup.prototype.require = function (prereq) {
    // if we are already ready, adding prereqs is illegal
    if (this.state !== 'init')
        throw new Error('task.enqueue() already called - too late for .require()');
    
    // avoid dependency bookkeeping if prereq is already ready
    if (prereq.state == 'ready')
        return this;
    
    // if we are already in error state, we're not going anywhere.
    if (this.state == 'error')
        return this;
    
    // ok, we're both in wait state.  set up the dependency.
    this._prereqs[prereq._task_id] = prereq;
    
    prereq.addCallback(this._prereq_callback.bind(this), prereq);
    prereq.addErrback(this._prereq_errback.bind(this), prereq);
    
    return this;
};

// callback when a prerequisite task succeeds
DeferredGroup.prototype._prereq_callback = function (result, prereq) {
  console.log("here1", result);
    if (this.opts.fireOnOneCallback === true) {
        this._prereqs = [];
    } else {
        delete this._prereqs[prereq._task_id];
    }
    
    this._prereqs_check();
    return result;
};

// errback when a prerequisite task fails
DeferredGroup.prototype._prereq_errback = function (error, prereq) {
    console.log("here2", error);
    if (this.opts.fireOnOneErrback === true) {
        this._prereqs = null;
        throw error;
    } else {
        delete this._prereqs[prereq._task_id];
    }
    
    return error;
};

DeferredGroup.prototype.summarize = function() {
    return null;
}

DeferredGroup.prototype.request = function (prereq) {
    this.result = this.summarize();
    this.runCallstack();
};

/**
*  Group Deferreds in an array
*/
var DeferredList = acre.task.define(DeferredGroup, [
    {name: "dlist"},
    {name: "opts", 'default':{}}
]);

DeferredList.prototype.init = function() {
    for each(var d in this.dlist) {
        this.require(d);
    }
    this.enqueue();
};

DeferredList.prototype.summarize = function() {
    var result = [];
    
    for each(var d in this.dlist) {
        if (d.state === "ready") {
            result.push(d.result);
        } else if (d.state === "error") {
            result.push(d.messages);
        } else {
            result.push(undefined);
        }
    }
    
    return result;
};


/**
*  Group Deferreds in an object
*/
var DeferredDict = acre.task.define(DeferredGroup, [
    {name: "ddict"},
    {name: "opts", 'default':{}}
]);

DeferredDict.prototype.init = function() {
    for (var key in this.ddict) {
        var d = this.ddict[key];
        this.require(d);
    }
    this.enqueue();
};

DeferredDict.prototype.summarize = function() {
    var result = {};
    
    for (var key in this.ddict) {
        var d = this.ddict[key];
        if (d.state === "ready") {
            result[key] = d.result;
        } else if (d.state === "error") {
            result[key] = d.messages;
        } else {
            result[key] = undefined;
        }
    }
    
    return result;
};


/**
*  Return a Deferred whether func is already a Deferred or a sync function
*/
var maybeDeferred = function(func, args) {
    var result = func.apply(this, args);
    if (result instanceof Deferred) {
        return result;
    } else {
        var d = Deferred();
        // TODO: needs some kind of setTimeout for addCallbacks to register
        d.callback(result);
        return d;
    }
};



/**
*  Make a Deferred fromm an async function with callback and/or errback args
*    - func = function reference
*    - callback_pos = number or dict with callback postiion in func signature
*      - position = array position in arguments
*      - key = key if argument is an object
*    - errback_pos = same as callback_pos, but for errback
*/
function makeDeferred(func, callback_pos, errback_pos) {
    
    function _normalize_pos(pos) {
        switch (typeof pos) {
            case "undefined" :
                return { position: null, key: null };
            case "number" : 
                return { position: pos, key: null };
            case "object" :
                if (pos.position && typeof pos.position !== "number")
                    throw "Callback 'position' property must be a number";
                return pos;
            default :
                throw "Unrecognized type for callback position -- must be a number or object with 'position' and/or 'key' values";
        }
    }
    
    function _place_callback(args, pos, func) {
        if (!pos.position)
            return args;
                    
        if(!pos.key) {
            args[pos.position] = func;
            return args;
        }
        
        if (typeof args[pos.position] !== "object")
            args[pos.position] = {};
        
        args[pos.position][pos.key] = func;
        return args;
    }
    
    return function() {
        var d = Deferred();
        
        args = Array.prototype.slice.call(arguments);        
        _place_callback(args, _normalize_pos(callback_pos), function(res) {
            d.callback(res);
        });
        _place_callback(args, _normalize_pos(errback_pos), function(e) {
            d.errback(e);
        });
        
        try {
            func.apply(null, args);
        } catch(e) {
            d.errback(e);
        }
        return d;
    }
}
