var Validator = function(options){
    
    var self = this,
    
        /**
         * @module deferred 
         */
        Deferred = function() {
                "use strict";

                var toolous = function() {
                        "use strict";
      
                        var toolous = {};

                        toolous.isArray = Array.isArray || function(obj) {
                                return toString.call(obj) == '[object Array]';
                        };

                        toolous.toArray = function(args, from) {
                                var ret = Array.prototype.slice.call(args, toolous.nvl(from, 0));
                                if (arguments.length > 2) {
                                        return toolous.toArray(arguments, 2).concat(ret);
                                        //skipping args and from
                                }
                                return ret;
                        };
    
                        toolous.nvl = function(val, def) {
                                return toolous.isDef(val) ? val : def;
                        };
 
                        toolous.isDef = function(o) {
                                return typeof o !== "undefined";
                        };

                        toolous.isFunction = function(o) {
                                return typeof o === "function";
                        };

                        toolous.merge = function(target, source) {
                                if (toolous.isDef(source)) {
                                        toolous.forEachKey(source, function(key, value) {
                                                target[key] = value;
                                        });
                                }

                                if (arguments.length > 2) {
                                        return toolous.merge.apply(toolous, toolous.toArray(arguments, 2, target));
                                }
                                return target;
                        };

                        toolous.forEach = function(arr, cb, thisArg) {
                                if (arr.forEach) {
                                        arr.forEach(cb, thisArg);
                                } else {
                                        for (var i = 0; i < arr.length; ++i) {
                                                if (toolous.isDef(arr[i])) {
                                                        cb.call(thisArg, arr[i], i, arr);
                                                }
                                        }
                                }
                        };

                        toolous.forEachKey = function(obj, cb, owned) {
                                var any = !toolous.nvl(owned, true);
                                for (var key in obj) {
                                        if (any || obj.hasOwnProperty(key)) {
                                                cb.call(obj, key, obj[key]);
                                        }
                                }
                        };

                        toolous.bind = function(fToBind, oThis) {
                                if ( typeof (fToBind) === "string") {
                                        fToBind = oThis[fToBind];
                                }
                                if (fToBind.bind) {
                                        return fToBind.bind.apply(fToBind, toolous.toArray(arguments, 1));
                                }
                                //Adapted from: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
                                if ( typeof fToBind !== "function") {
                                        // closest thing possible to the ECMAScript 5 internal IsCallable function
                                        throw new TypeError("toolous.bind - what is trying to be bound is not callable");
                                }

                                var aArgs = toolous.toArray(arguments, 2), NOPf = function() {
                                }, fBound = function() {
                                        return fToBind.apply(this instanceof NOPf && oThis ? this : oThis, aArgs.concat(toolous.toArray(arguments)));
                                };

                                NOPf.prototype = fToBind.prototype;
                                fBound.prototype = new NOPf();

                                return fBound;
                        };
                        return toolous;
                }();

                function CallbackList(options) {
                        this._callbacks = [];
                        this.options = toolous.merge({
                                once : false,
                                memory : true
                        }, options);
                }

                CallbackList.prototype.add = function(cb) {
                        this._callbacks.push(cb);
                        if (this.firedArgs) {//memory, firedArgs is always trueish if exists (since it is an array)
                                cb.apply(this.firedContext, this.firedArgs);
                                if (this.options.once) {//clean listeners
                                        this._callbacks = [];
                                }
                                //also removes the listener if once===true
                        }
                        return this;
                };

                CallbackList.prototype.fireWith = function(context) {
                        var args = toolous.toArray(arguments, 1);
                        //ignore context as a parameter to the callback
                        if (this.options.memory) {//store value in memory
                                this.firedArgs = args;
                                this.firedContext = context;
                        }
                        toolous.forEach(this._callbacks, function(cb) {
                                cb.apply(context, args);
                        });
                        if (this.options.once) {//clean listeners
                                this._callbacks = [];
                        }
                        return this;
                };

                CallbackList.prototype.fire = function() {//Fire without context
                        return this.fireWith.apply(this, toolous.toArray(arguments, 0, null));
                };

                function FSM(options) {
                        options = toolous.merge({
                                state : "initial"
                        }, options);

                        this._state = String(options.state);
                        this._listeners = {};
                        this._stateOpts = toolous.nvl(options.statesOptions, {});
                        this._actualStateOpts = {};

                        this._stateOptDefs = {
                                once : !!toolous.nvl(options.once, true),
                                memory : !!toolous.nvl(options.memory, true),
                                finalState : !!toolous.nvl(options.finalState, false)
                        };
                }

                FSM.prototype._getStateOptions = function(state) {
                        var actual = this._actualStateOpts[state];
                        if (!toolous.isDef(actual)) {
                                this._actualStateOpts[state] = actual = toolous.merge({}, this._stateOptDefs, this._stateOpts[state]);
                        }
                        return actual;
                };

                FSM.prototype._getCallbackList = function(state) {
                        var cbList = this._listeners[state];
                        if (!cbList) {//create CallbackList
                                var cblOptions = this._getStateOptions(state);
                                this._listeners[state] = cbList = new CallbackList(cblOptions);
                        }
                        return cbList;
                };

                FSM.prototype.on = function(state, func) {
                        state = String(state);
                        var cbList = this._getCallbackList(state);
                        cbList.add(func);
                };

                FSM.prototype.state = function(state,context) {
                        if (toolous.isDef(state)) {//change
                                var currentStateOptions = this._getStateOptions(this._state);
                                //check if final
                                if (currentStateOptions.finalState) {
                                        return false;
                                        //Cannot change.
                                }
                                this._state = state = String(state);
                                var args = toolous.toArray(arguments, 1); //Removing state, keeping context //2, context);
                                //skipping state
                                var cbList = this._getCallbackList(state);
                                cbList.fireWith.apply(cbList, args);
                        }
                        //get
                        return this._state;
                };

                var PROMISE_FUNCTIONS = [

                        "state",

                        "then",

                        "done",

                        "fail",

                        "always",

                        "pipe",

                        "progress"];

                function Promise(deferred) {
                        var promise = this;
                        toolous.forEach(PROMISE_FUNCTIONS, function(funcName) {
                                promise[funcName] = function() {
                                        var ret = deferred[funcName].apply(deferred, arguments);
                                        return ret === deferred ? promise : ret;
                                        //Not returning the deferred object.
                                };
                        });
                        promise.promise = function() {
                                return this;
                        };
                }

                var STATES = {
                        resolved : {

                                fire : "resolve",
                                listen : "done",
                                thenIndex : 0,
                                memory : true,
                                once : true,
                                query : "isResolved",
                                finalState : true
                        },
                        rejected : {

                                fire : "reject",
                                listen : "fail",
                                thenIndex : 1,
                                memory : true,
                                once : true,
                                query : "isRejected",
                                finalState : true
                        },
                        pending : {
 
                                fire : "notify",
                                listen : "progress",
                                thenIndex : 2,
                                memory : true,
                                once : false
                        }
                };

                function Deferred(init) {
                        if (!(this instanceof Deferred)) {//must be called with new.
                                return new Deferred(init);
                        }
                        var deferred = this;
                        this._fsm = new FSM({
                                state : "pending",
                                statesOptions : STATES
                        });

                        var promise = new Promise(this);
                        this.promise = function(obj) {
                                if (!toolous.isDef(obj)) {
                                        return promise;
                                } else {
                                        toolous.merge(obj, promise);
                                        //copy properties, instanceof will not work.
                                        return obj;
                                }
                        };

                        toolous.forEachKey(Deferred.prototype, function(name,func) {
                                deferred[name] = toolous.bind(func,deferred);
                        });
                        this.pipe = this.then;

                        if (toolous.isDef(init)) {
                                init.call(this, this);
                        }
                }


                toolous.forEachKey(STATES, function(state, stateDefinition) {
                        var fire = stateDefinition.fire, listen = stateDefinition.listen, query = stateDefinition.query;

                        Deferred.prototype[listen] = function(cb) {//Add listeners
                                var callbacks = [];
                                toolous.forEach(toolous.toArray(arguments), function(cb) {
                                        if (toolous.isArray(cb)) {
                                                callbacks = callbacks.concat(cb);
                                        }
                                        else if(toolous.isFunction(cb)) {
                                                callbacks.push(cb);
                                        }
                                });
                                // console.log(callbacks);
                                var me = this;
                                toolous.forEach(callbacks, function(cb) {
                                        me._fsm.on(state, cb);
                                });

                                return this;
                        };
                        Deferred.prototype[fire] = function() {
                                this[fire + "With"].apply(this, toolous.toArray(arguments, 0, this.promise()));
                                return this;
                        };
                        Deferred.prototype[fire + "With"] = function(context) {
                                this._fsm.state.apply(this._fsm, toolous.toArray(arguments, 1, state, context));
                                return this;
                        };

                        if (query) {
                                Deferred.prototype[query] = function() {
                                        return this._fsm.state() === state;
                                };
                        }
                });

                Deferred.prototype.always = function() {
                        return this.done.apply(this, arguments).fail.apply(this, arguments);
                };

                Deferred.prototype.state = function() {
                        return this._fsm.state();
                };
  
                Deferred.prototype.then = function(/*doneFilter, failFilter, progressFilter*/) {//Took some inspiration from jQuery's implementation at https://github.com/jquery/jquery/blob/master/src/deferred.js
                        var args = arguments,
                                retDeferred = new Deferred(), //"returns a new promise that can filter the status and values of a deferred through a function"
                                me = this; //The deferred on which to perform the filter
                        toolous.forEachKey(STATES, function(state, stateDefinition) {
                                var i = stateDefinition.thenIndex,
                                // fire = stateDefinition.fire,
                                        listen = stateDefinition.listen,
                                        filter = toolous.isFunction(args[i]) && args[i];
                                me[listen](function() {
                                        var filterResult = filter && filter.apply(this, arguments);
                                        if (Deferred.isObservable(filterResult)) {
                                                //Case A: "These filter functions can return"..."[an] observable
                                                //			object (Deferred, Promise, etc) which will pass its 
                                                //			resolved / rejected status and values to the promise's callbacks"
                                                var filterPromise = filterResult.promise();
                                                //Listening to any event on the observable, passing the
                                                //call into the returned promise:
                                                toolous.forEachKey(STATES, function(_, chainStateDefinition) {
                                                        filterPromise[chainStateDefinition.listen](function() {
                                                                //Prepending 'this' in order to keep the same context
                                                                //the event which should be the same as given to the
                                                                //filter promise.
                                                                var args = toolous.toArray(arguments, 0, this); 
                                                                retDeferred[chainStateDefinition.fire+"With"].apply(retDeferred, args);
                                                        });
                                                });
                                        } else {//value, passed along
                                                //Case B: "If the filter function used is null, or not specified,
                                                //			the promise will be resolved or rejected with the same
                                                //			values as the original."
                                                //Case C: "These filter functions can return a new value to be
                                                //			passed along to the promise's .done() or .fail() callbacks"

                                                //If the context is the original deferred object, it wasn't specified
                                                //and we need to pass the returned deferred Otherwise we pass the new context 
                                                var context = (Deferred.isObservable(this) && this.promise() === me.promise()) ?
                                                                                        retDeferred.promise() : this;

                                                //"If the filter function used is null, or not specified, the promise
                                                // will be resolved or rejected with the same values as the original.":
                                                var eventArgs = filter ? [filterResult] : toolous.toArray(arguments);

                                                retDeferred[stateDefinition.fire + "With"].apply(retDeferred,
                                                                                                                        [context].concat(eventArgs));

                                        }
                                });
                        });
                        return retDeferred.promise();
                };

                /**
                 * returns true if and only if the given object is a deferred or promise instance (has the .promise method)
                 * @static 
                 * @param {Object} obj
                 * @method isObservable
                 */
                Deferred.isObservable = function(obj) {
                        return obj !== null && toolous.isDef(obj) && (toolous.isFunction(obj.promise));
                };
                /**
                 * see http://api.jquery.com/jQuery.when/
                 * @method when
                 * @for deferred
                 * @static
                 */
                Deferred.when = function(single) {
                        var whenArgs = toolous.toArray(arguments),
                                resDef = new Deferred(),
                                remaining = whenArgs.length,
                                combinedState = {};

                        if (remaining <= 1) { //Single 
                                if(!Deferred.isObservable(single)) {
                                        //"If a single argument is passed to jQuery.when and it is not a
                                        // Deferred or a Promise, it will be treated as a resolved Deferred
                                        // and any doneCallbacks attached will be executed immediately"
                                        single = new Deferred().resolveWith(null, single);
                                }
                                //"If a single Deferred is passed to jQuery.when, its Promise object
                                // (a subset of the Deferred methods) is returned by the method""
                                return single.promise();
                        }

                        //Multiple values:
                        toolous.forEach(["resolve","notify"], function(name) {
                                combinedState[name] = {
                                        "name": name,
                                        "contexts": new Array(remaining),
                                        "values": new Array(remaining),
                                        mark: function(i, context, value) {
                                                this.contexts[i] = context;
                                                this.values[i] = value;
                                        },
                                        createMarkFunction: function(i) {
                                                var me = this;
                                                return function(value) {
                                                        me.mark(i, this, value);
                                                };
                                        },
                                        publish: function() {
                                                resDef[name+"With"].apply(resDef,[this.contexts].concat(this.values));
                                        }
                                };
                        });

                        var valueReceived = function() { 
                                --remaining;
                                if (remaining === 0) {
                                        combinedState.resolve.publish();
                                }
                        };

                        toolous.forEach(whenArgs, function(whenPart, i) {
                                if (Deferred.isObservable(whenPart)) {
                                        whenPart = whenPart.promise();

                                        whenPart.done(combinedState.resolve.createMarkFunction(i));  //Mark the ith deferred as returned.
                                        whenPart.done(valueReceived); //Then count the value received and check if done

                                        whenPart.progress(combinedState.notify.createMarkFunction(i)); //Mark progress
                                        whenPart.progress(toolous.bind("publish",combinedState.notify)); //Notify progress

                                        whenPart.fail(function(error) { //Notify failure
                                                resDef.rejectWith(this, error);
                                        });
                                } else { //Immidiate value:
                                        combinedState.resolve.mark(i, undefined, whenPart);
                                        valueReceived();
                                }
                        });

                        return resDef.promise();
                };

                return Deferred;

        }(),
        
        Util = Validator.Util;
    
    options = Util.extend({

        'attr' : 'data-validate',
        
        'ruleSeparator' : /\s+/,
        
        'ruleArgumentSeparator' : ':',
        
        'argumentSeparator' : ',',

        'onBeforeValidateElement' : function(input){},
        'onBeforeValidateForm' : function(form){},
        'onInputSuccess' : function(input,message,validatorName,args){},
        'onInputFail' : function(input,message,validatorName,args){},
        'onSuccess' : function(form){
            form.submit();
        },
        'onFail' : function(form){},
        
        'defaultMessage'      : 'Please check this field for errors'

    },Validator.plugins,options);
    
    
    
    this.message = function(value,valName,args){
        var message = options.messages[valName] ? options.messages[valName] : options.defaultMessage;
        return Util.interpolate(message.replace('{value}',value),args);  
    };

    this.validate = function(input, valName, args, callback){
        
        var tmp = args.slice(0); 
        tmp.push(callback);

        options.validators[valName] ?
            options.validators[valName].apply(input,tmp) : 
            options.regex[valName] ?
                callback(!input.value.length || options.regex[valName].test(input.value)) :
                Util.error('A validator or regex has not been set for  "' + valName + '"');
        
        return this;
    };

    this.element = function(input){
        
        options.onBeforeValidateElement(input);
        
        for (var i = 0, defs = [], list = input.getAttribute(options.attr).split(options.ruleSeparator); i < list.length; i++) {
            
            defs[i] = Deferred();
            
            var parts = list[i].split(options.ruleArgumentSeparator);
 
            (function(i,valName,args){
                self.validate(input, valName, args, function(result){
                    (result ? defs[i].resolve(valName, args) : defs[i].reject(valName, args));
                });
            })(i,parts[0], parts[1] ? parts[1].split(options.argumentSeparator) : []);          
            
        }

        var when = Deferred.when.apply(this,defs);

        when.always(function(valName,args){
            var func = when.state() === 'resolved' ? options.onInputSuccess : options.onInputFail;
            func && func(input, self.message(input.value, valName, args), valName, args);
        });
        
        return defs;
    };
    
    this.form = function(form){

        options.onBeforeValidateForm(form);

        for (var i = 0,  defs = [], inputs = Util.getElementsByTagNames('input,select,checkbox,textarea',form); i < inputs.length; ++i) {
            defs = defs.concat(this.element(inputs[i]));
        }
        
        Deferred.when.apply(this,defs).then(function(){
            options.onSuccess(form);
        },function(){
            options.onFail(form);
        });
        
        return defs;
    };
};

Validator.plugin = function(plugin){
    Validator.Util.extend(Validator.plugins,Validator.Util.only(plugin,['messages','regex','validators']));
};

Validator.Util = {
    'only'  : function(o,k){var t = {};for(var a in k)if(o[k[a]]) t[k[a]] = o[k[a]];return t},
    'interpolate' : function(s,a){for(var i in a){s = s.replace('{'+i+'}',a[i]);}return s},
    'extend' : function(){var e=function(t,n){for(var r in n){if(n.hasOwnProperty(r)){var i=n[r];if(t.hasOwnProperty(r)&&typeof t[r]==="object"&&typeof i==="object"){e(t[r],i)}else{t[r]=i}}}return t};var t={};for(var n=0;n<arguments.length;n++){t=e(t,arguments[n])}return t},
    'error' : function(message){throw new Error(message);},
    'getElementsByTagNames' : function(e,t){if(!t)var t=document;var n=e.split(",");var r=new Array;for(var i=0;i<n.length;i++){var s=t.getElementsByTagName(n[i]);for(var o=0;o<s.length;o++){r.push(s[o])}}var u=r[0];if(!u)return[];if(u.sourceIndex){r.sort(function(e,t){return e.sourceIndex-t.sourceIndex})}else if(u.compareDocumentPosition){r.sort(function(e,t){return 3-(e.compareDocumentPosition(t)&6)})}return r}
};

Validator.plugins = {
    'messages' : {
        'email'           : 'Please enter a valid email address',
        'url'             : 'Please enter a valid URL',
        'alpha'           : 'Please enter only alphabetic characters',
        'alnum'           : 'Please enter only alphabetic characters',
        'alnumextended'   : 'Please enter only A-Z 0-9 _ - characters',
        'integer'         : 'Please enter only whole integers',
        'number'          : 'Please enter a number',
        'positive'        : 'Please enter a positive number',
        'negative'        : 'Please enter a negative number',
        'telephone'       : 'Please enter a valid telephone number',
        'required'        : 'Please fill out this field',
        'length'          : 'Please ensure the value is exactly {0} characters in length',
        'minlength'       : 'Please ensure the value is greater than {0} characters in length',
        'maxlength'       : 'Please ensure the value is less than {0} characters in length',
        'empty'           : 'Please do not fill out this field',
        'min'             : 'Please enter a number greater than or equal to {0}',
        'max'             : 'Please enter a number less than or equal to {0}',
        'checked'         : 'Please check the box to continue'
    },

    'regex' : {
        'email'           : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
        'url'             : /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
        'alpha'           : /^[A-Za-z]+$/,
        'alnum'           : /^[A-Za-z0-9]+$/,
        'alnumextended'   : /^[A-Za-z0-9_-]+$/,
        'integer'         : /^\s*(\+|-)?\d+\s*$/,
        'number'          : /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/,
        'telephone'       : /^(?:\((\+?\d+)?\)|\+?\d+) ?\d*(-?\d{2,3} ?){0,4}$/,
        'required'        : /^\s*$/,
        'empty'           : /^$/
    },

    'validators' : {
        'positive' : function(callback){
            callback(Validator.plugins.regex.number.test(this.value) && this.value >= 0);
        },
        'negative' : function(callback){
            callback(Validator.plugins.regex.number.test(this.value) && this.value <= 0);
        },
        'min' : function(min,callback){
            callback(Validator.plugins.regex.number.test(this.value) && this.value >= parseFloat(min));
        },
        'max' : function(max,callback){
            callback(Validator.plugins.regex.number.test(this.value) && this.value <= parseFloat(max));
        },
        'required' :function(callback){
            callback(!Validator.plugins.regex.required.test(this.value));
        },
        'length' : function(size,callback){
            callback(this.value.length == size);
        },
        'minlength' : function(size,callback){
            callback(this.value.length >= size);
        },
        'maxlength' : function(size,callback){
            callback(this.value.length <= size);
        },
        'checked' : function(callback){
            callback(this.checked);
        }
    }
};

