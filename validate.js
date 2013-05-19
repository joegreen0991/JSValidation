var Validator = function(options){
    
    var self = this,
    
        Promise = function() {
            var defer = function() {
                return new function() {
                    var state = null,
                        chain = [],
                        args = [],
                        fire = function(a) {
                            args = a || args;
                            while (chain.length) {
                                (chain.shift())[state === false ? 1 : 0].apply(this, args);
                            }
                        },
                        noop = function(){};

                    this.then = function(callback, errback) {
                        chain.push([callback || noop, errback || noop]);
                        state !== null && fire();
                        return this;
                    };
                    this.resolve = function() {
                        state = true;
                        fire(arguments);
                    };
                    this.reject = function() {
                        state = false;
                        fire(arguments);
                    };
                };
            };

            defer.when = function(args) {
                var deferred = defer(),
                    results = 0,
                    failed = false;

                for (var i = 0, len = args.length; i < len; i++) {
                    args[i].then(function() {
                        args.length === ++results && deferred.resolve();
                    }, function() {
                        failed = failed || deferred.reject.apply(deferred,arguments) || true;
                    });
                }

                return deferred;
            };
            
            return defer;
        }(),
        
        Util = Validator.Util;
    
    options = Util.extend({

        'attr' : 'data-validate',
        
        'ruleSeparator' : /\s+/,
        
        'ruleArgumentSeparator' : ':',
        
        'argumentSeparator' : ',',

        'onBeforeValidateElement' : function(input){},
        'onBeforeValidateForm' : function(form){},
        'onInputSuccess' : function(input){},
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
            
            defs[i] = Promise();
            
            var parts = list[i].split(options.ruleArgumentSeparator);
            
            (function(i,valName,args){
                self.validate(input, valName, args, function(result){
                    (result ? defs[i].resolve() : defs[i].reject(valName, args));
                });
            })(i,parts[0], parts[1] ? parts[1].split(options.argumentSeparator) : []);          
            
        }

        Promise.when(defs).then(function(){
            options.onInputSuccess(input);
        },function(valName, args){
            options.onInputFail(input, self.message(input.value, valName, args), valName, args);
        });
        
        return defs;
    };
    
    this.form = function(form){

        options.onBeforeValidateForm(form);

        for (var i = 0,  defs = [], inputs = Util.getElementsByTagNames('input,select,checkbox,textarea',form); i < inputs.length; ++i) {
            defs = defs.concat(this.element(inputs[i]));
        }
        
        Promise.when(defs).then(function(){
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

