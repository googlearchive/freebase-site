/**
*  Standard object for all errors in Deferreds
*/
function DeferredError(e, message, info) {
    if (e instanceof Error) {
        this.code = e.code || "/internal/javascript";
        this.message = message || e.message || null;
        this.info = info || e.info || e;
    } else {
        this.code = e || "/internal";
        this.message = message ||  null;
        this.info = info || null;
    }
    return this;
}


/**
*  A Task that supports callback/errback chaining
*/
var Deferred = acre.task.define(null, []);

Deferred.prototype.request = function(){
    // Any Tasks based on Deferred need this to be the last line in request()
    this.runCallstack();
};

Deferred.prototype._add_error = function(e, msg, info){
    if (!this.messages)
        this.messages = null;
        
    if (typeof e !== 'undefined') {
        var error = (e instanceof DeferredError) ? e : new DeferredError(e, msg, info);
        console.error(error.message, error);
        this.messages = error;
    }
    
    this.not_in_error = false;
}

Deferred.prototype.error = function (e, msg, info) {
    this._error([this.messages]);
    throw this.messages[0].message;
};

Deferred.prototype.callback = function(data){
    this.result = data;
    this.messages = null;
    return this.enqueue();
};

Deferred.prototype.errback = function(e, msg, info){
    this.result = null;
    this._add_error(e, msg, info);
    return this.enqueue();
};

Deferred.prototype._add_call = function(kind, thunkspec){
    if (!this.callstack)
        this.callstack = [];
        
    this.callstack.push({
        kind : kind,
        thunkspec : thunkspec
    });
    
    return this;
};

Deferred.prototype.addCallback = function(THUNK_ARGS){
    if (this.state == 'ready') {
        return this._run_call({kind:"callback", thunkspec: acre.task.vthunk(arguments)});
    } else {
        return this._add_call("callback", acre.task.vthunk(arguments));
    }
};

Deferred.prototype.addErrback = function(THUNK_ARGS){
    if (this.state == 'error') {
        return this._run_call({kind:"errback", thunkspec: acre.task.vthunk(arguments)});
    } else {
        return this._add_call("errback",  acre.task.vthunk(arguments));
    }
};

Deferred.prototype.addBoth = function(func, opts){
    return this._add_call("both", func, opts);
};

Deferred.prototype._run_call = function(cb) {
    try {
        var result;
        if (cb.kind !== "errback") {
            result = acre.task.vcall(cb.thunkspec, this.result);
        } else {
            result = acre.task.vcall(cb.thunkspec, this.messages);
            this.not_in_error = true;
        }

        if (result instanceof Deferred) {
            var thiss = this;
            result.addCallback(function(data){
                thiss.result = data;
                thiss.runCallstack();
            });
            result.addErrback(function(e, msg, info){
                thiss._add_error(e, msg, info);
                thiss.runCallstack();
            });
        } else {
            this.result = result;
            return this.runCallstack();
        }
    } catch(e) {
        this._add_error(e);
        return this.runCallstack();
    }
    return this;
}

Deferred.prototype.runCallstack = function(){
    if  (typeof this.not_in_error === 'undefined') {
        this.not_in_error = true;
    }

    if (!this.callstack || !this.callstack.length) {
        if (this.state === "wait") {
            if(this.not_in_error) {
                this.ready(this.result);
            } else {
                this.error();
            }            
        }
        return this;
    }

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
var DeferredGroup = acre.task.define(Deferred, [{name: "ddict"}, {name: "opts", 'default':{}}]);

DeferredGroup.prototype.require = function (prereq) {
    // avoid dependency bookkeeping if prereq is already ready
    if (prereq.state == 'ready')
        return this;

    // pass on any immediate errors
    if (prereq.state == 'error')
        return this._prereq_error(prereq);

    // ok, we're both in wait state.  set up the dependency.
    this._prereqs[prereq._task_id] = prereq;
    
    prereq
        .addCallback('_prereq_ready', this, prereq)
        .addErrback('_prereq_error', this, prereq);

    return this;
};

DeferredGroup.prototype._prereqs_check = function () {
    if (this._prereqs === null)
        return this;

    // if there are any remaining prereqs, bail
    for (var prereq in this._prereqs)
        return this;

    return this.finish();
};

DeferredGroup.prototype._prereq_ready = function (prereq) {
    if (this.opts.fireOnOneCallback || this._prereqs === null)
        return this.finish();
        
    delete this._prereqs[prereq._task_id];
    this._prereqs_check();
    return prereq.result;
};

DeferredGroup.prototype._prereq_error = function (prereq) {
    if (this.opts.fireOnOneErrback || this._prereqs === null)
        return this.finish();

    delete this._prereqs[prereq._task_id];
    this._prereqs_check();
    
    if (this.opts.consumeErrors) {
        return true;
    } else {
        throw prereq.messages;
    }
};

DeferredGroup.prototype.finish = function() {
    this._prereqs = null;
    this.enqueue();
    return this.request(); 
}

DeferredGroup.prototype.request = function (prereq) {
    if (this.summarize)
        this.result = this.summarize();

    this.runCallstack();
};



/**
*  Group Deferreds in an array
*/
var DeferredList = acre.task.define(DeferredGroup, [{name: "dlist"}, {name: "opts", 'default':{}}]);

DeferredList.prototype.init = function(){
    var dl = this;
    this.dlist.forEach(function(d){
        dl.require(d, false);
    });
};

DeferredList.prototype.summarize = function(){
    var result = [];

    this.dlist.forEach(function(d){
        result.push({
            success : (d.state === "ready" ? true : false),
            result : d.result || null,
            messages : d.messages || null
        });
    });
    
    return result;
};



/**
*  Group Deferreds in an object
*/
var DeferredDict = acre.task.define(DeferredGroup, [{name: "ddict"}]);

DeferredDict.prototype.init = function(){
    for (var key in this.ddict) {
        var d = this.ddict[key];
        this.require(d, false);
    }
};

DeferredDict.prototype.summarize = function(){
    var result = {};

    for (var key in this.ddict) {
        var d = this.ddict[key];
        result[key] = {
            success : (d.state === "ready" ? true : false),
            result : d.result || null,
            messages : d.messages || null
        };
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
        
    return function(){
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
