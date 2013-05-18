

var Validator = function(options){
    
    var self = this,
    
        Deferred=function(){"use strict";function t(t){this._callbacks=[];this.options=e.merge({once:false,memory:true},t)}function n(t){t=e.merge({state:"initial"},t);this._state=String(t.state);this._listeners={};this._stateOpts=e.nvl(t.statesOptions,{});this._actualStateOpts={};this._stateOptDefs={once:!!e.nvl(t.once,true),memory:!!e.nvl(t.memory,true),finalState:!!e.nvl(t.finalState,false)}}function i(t){var n=this;e.forEach(r,function(e){n[e]=function(){var r=t[e].apply(t,arguments);return r===t?n:r}});n.promise=function(){return this}}function o(t){if(!(this instanceof o)){return new o(t)}var r=this;this._fsm=new n({state:"pending",statesOptions:s});var u=new i(this);this.promise=function(t){if(!e.isDef(t)){return u}else{e.merge(t,u);return t}};e.forEachKey(o.prototype,function(t,n){r[t]=e.bind(n,r)});this.pipe=this.then;if(e.isDef(t)){t.call(this,this)}}var e=function(){"use strict";var e={};e.isArray=Array.isArray||function(e){return toString.call(e)=="[object Array]"};e.noop=function(){};e.toArray=function(t,n){var r=Array.prototype.slice.call(t,e.nvl(n,0));if(arguments.length>2){return e.toArray(arguments,2).concat(r)}return r};e.nvl=function(t,n){return e.isDef(t)?t:n};e.isDef=function(e){return typeof e!=="undefined"};e.isFunction=function(e){return typeof e==="function"};e.merge=function(t,n){if(e.isDef(n)){e.forEachKey(n,function(e,n){t[e]=n})}if(arguments.length>2){return e.merge.apply(e,e.toArray(arguments,2,t))}return t};e.forEach=function(t,n,r){if(t.forEach){t.forEach(n,r)}else{for(var i=0;i<t.length;++i){if(e.isDef(t[i])){n.call(r,t[i],i,t)}}}};e.forEachKey=function(t,n,r){var i=!e.nvl(r,true);for(var s in t){if(i||t.hasOwnProperty(s)){n.call(t,s,t[s])}}};e.bind=function(t,n){if(typeof t==="string"){t=n[t]}if(t.bind){return t.bind.apply(t,e.toArray(arguments,1))}if(typeof t!=="function"){throw new TypeError("toolous.bind - what is trying to be bound is not callable")}var r=e.toArray(arguments,2),i=function(){},s=function(){return t.apply(this instanceof i&&n?this:n,r.concat(e.toArray(arguments)))};i.prototype=t.prototype;s.prototype=new i;return s};return e}();t.prototype.add=function(e){this._callbacks.push(e);if(this.firedArgs){e.apply(this.firedContext,this.firedArgs);if(this.options.once){this._callbacks=[]}}return this};t.prototype.fireWith=function(t){var n=e.toArray(arguments,1);if(this.options.memory){this.firedArgs=n;this.firedContext=t}e.forEach(this._callbacks,function(e){e.apply(t,n)});if(this.options.once){this._callbacks=[]}return this};t.prototype.fire=function(){return this.fireWith.apply(this,e.toArray(arguments,0,null))};n.prototype._getStateOptions=function(t){var n=this._actualStateOpts[t];if(!e.isDef(n)){this._actualStateOpts[t]=n=e.merge({},this._stateOptDefs,this._stateOpts[t])}return n};n.prototype._getCallbackList=function(e){var n=this._listeners[e];if(!n){var r=this._getStateOptions(e);this._listeners[e]=n=new t(r)}return n};n.prototype.on=function(e,t){e=String(e);var n=this._getCallbackList(e);n.add(t)};n.prototype.state=function(t,n){if(e.isDef(t)){var r=this._getStateOptions(this._state);if(r.finalState){return false}this._state=t=String(t);var i=e.toArray(arguments,1);var s=this._getCallbackList(t);s.fireWith.apply(s,i)}return this._state};var r=["state","then","done","fail","always","pipe","progress"];var s={resolved:{fire:"resolve",listen:"done",thenIndex:0,memory:true,once:true,query:"isResolved",finalState:true},rejected:{fire:"reject",listen:"fail",thenIndex:1,memory:true,once:true,query:"isRejected",finalState:true},pending:{fire:"notify",listen:"progress",thenIndex:2,memory:true,once:false}};e.forEachKey(s,function(t,n){var r=n.fire,i=n.listen,s=n.query;o.prototype[i]=function(n){var r=[];e.forEach(e.toArray(arguments),function(t){if(e.isArray(t)){r=r.concat(t)}else if(e.isFunction(t)){r.push(t)}});var i=this;e.forEach(r,function(e){i._fsm.on(t,e)});return this};o.prototype[r]=function(){this[r+"With"].apply(this,e.toArray(arguments,0,this.promise()));return this};o.prototype[r+"With"]=function(n){this._fsm.state.apply(this._fsm,e.toArray(arguments,1,t,n));return this};if(s){o.prototype[s]=function(){return this._fsm.state()===t}}});o.prototype.always=function(){return this.done.apply(this,arguments).fail.apply(this,arguments)};o.prototype.state=function(){return this._fsm.state()};o.prototype.then=function(){var t=arguments,n=new o,r=this;e.forEachKey(s,function(i,u){var a=u.thenIndex,f=u.listen,l=e.isFunction(t[a])&&t[a];r[f](function(){var t=l&&l.apply(this,arguments);if(o.isObservable(t)){var i=t.promise();e.forEachKey(s,function(t,r){i[r.listen](function(){var t=e.toArray(arguments,0,this);n[r.fire+"With"].apply(n,t)})})}else{var a=o.isObservable(this)&&this.promise()===r.promise()?n.promise():this;var f=l?[t]:e.toArray(arguments);n[u.fire+"With"].apply(n,[a].concat(f))}})});return n.promise()};o.isObservable=function(t){return t!==null&&e.isDef(t)&&e.isFunction(t.promise)};o.when=function(t){var n=e.toArray(arguments),r=new o,i=n.length,s={};if(i<=1){if(!o.isObservable(t)){t=(new o).resolveWith(null,t)}return t.promise()}e.forEach(["resolve","notify"],function(e){s[e]={name:e,contexts:new Array(i),values:new Array(i),mark:function(e,t,n){this.contexts[e]=t;this.values[e]=n},createMarkFunction:function(e){var t=this;return function(n){t.mark(e,this,n)}},publish:function(){r[e+"With"].apply(r,[this.contexts].concat(this.values))}}});var u=function(){--i;if(i===0){s.resolve.publish()}};e.forEach(n,function(t,n){if(o.isObservable(t)){t=t.promise();t.done(s.resolve.createMarkFunction(n));t.done(u);t.progress(s.notify.createMarkFunction(n));t.progress(e.bind("publish",s.notify));t.fail(function(e){r.rejectWith(this,e)})}else{s.resolve.mark(n,undefined,t);u()}});return r.promise()};return o}(),
        
        Util = {
            interpolate : function(s,a){for(var i in a){s = s.replace('{'+i+'}',a[i]);}return s},
            extend : function(e,t){for(var n in t){if(t.hasOwnProperty(n)){var r=t[n];if(e.hasOwnProperty(n)&&typeof e[n]==="object"&&typeof r==="object"){Util.extend(e[n],r)}else{e[n]=r}}}return e},
            error : function(message){throw new Error(message);},
            getElementsByTagNames : function(e,t){if(!t)var t=document;var n=e.split(",");var r=new Array;for(var i=0;i<n.length;i++){var s=t.getElementsByTagName(n[i]);for(var o=0;o<s.length;o++){r.push(s[o])}}var u=r[0];if(!u)return[];if(u.sourceIndex){r.sort(function(e,t){return e.sourceIndex-t.sourceIndex})}else if(u.compareDocumentPosition){r.sort(function(e,t){return 3-(e.compareDocumentPosition(t)&6)})}return r}
        };
    
    options = Util.extend({

        attr : 'data-validate',
        
        ruleSeparator : /\s+/,
        
        ruleArgumentSeparator : ':',
        
        argumentSeparator : ',',

        onBeforeValidateElement : function(input){},
        onBeforeValidateForm : function(form){},
        onInputSuccess : function(input,message,validatorName,args){},
        onInputFail : function(input,message,validatorName,args){},
        onSuccess : function(form){
            form.submit();
        },
        onFail : function(form){},
        
        defaultMessage      : 'Please check this field for errors',
        
        messages : {
            email           : 'Please enter a valid email address',
            url             : 'Please enter a valid URL',
            alpha           : 'Please enter only alphabetic characters',
            alnum           : 'Please enter only alphabetic characters',
            alnumextended   : 'Please enter only A-Z 0-9 _ - characters',
            integer         : 'Please enter only whole integers',
            float           : 'Please enter a number',
            positive        : 'Please enter a positive number',
            negative        : 'Please enter a negative number',
            telephone       : 'Please enter a valid telephone number',
            required        : 'Please fill out this field',
            length          : 'Please ensure the value is exactly {0} characters in length',
            minlength       : 'Please ensure the value is greater than {0} characters in length',
            maxlength       : 'Please ensure the value is less than {0} characters in length',
            empty           : 'Please do not fill out this field',
            min             : 'Please enter a number greater than or equal to {0}',
            max             : 'Please enter a number less than or equal to {0}',
            checked         : 'Please check the box to continue'
        },

        regex : {
            email           : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            url             : /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
            alpha           : /^[A-Za-z]+$/,
            alnum           : /^[A-Za-z0-9]+$/,
            alnumextended   : /^[A-Za-z0-9_-]+$/,
            integer         : /^\s*(\+|-)?\d+\s*$/,
            float           : /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/,
            telephone       : /^(?:\((\+?\d+)?\)|\+?\d+) ?\d*(-?\d{2,3} ?){0,4}$/,
            required        : /^\s*$/,
            empty           : /^$/
        },

        validators : {
            positive : function(callback){
                callback(options.regex.float.test(this.value) && this.value >= 0);
            },
            negative : function(callback){
                callback(options.regex.float.test(this.value) && this.value <= 0);
            },
            min : function(min,callback){
                callback(options.regex.float.test(this.value) && this.value >= parseFloat(min));
            },
            max : function(max,callback){
                callback(options.regex.float.test(this.value) && this.value <= parseFloat(max));
            },
            required :function(callback){
                callback(!options.regex.required.test(this.value));
            },
            length : function(size,callback){
                callback(this.value.length == size);
            },
            minlength : function(size,callback){
                callback(this.value.length >= size);
            },
            maxlength : function(size,callback){
                callback(this.value.length <= size);
            },
            checked : function(callback){
                callback(this.checked);
            }
        }
    },options);
    
    
    
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