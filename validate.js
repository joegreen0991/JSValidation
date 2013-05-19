var Validator = function(){
        
    var Validator = function(options){
    
        var Promise = function() {
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

            },Validator.plugins,options),

            message = function(value,valName,args){
                var message = options.messages[valName] ? options.messages[valName] : options.defaultMessage;
                return Util.tmpl(message.replace('{value}',value),args);  
            },
            validate = function(input, valName, args, callback){

                var tmp = args.slice(0); 
                tmp.push(callback);

                options.validators[valName] ?
                    options.validators[valName].apply(input,tmp) : 
                    options.regex[valName] ?
                        callback(!input.value.length || options.regex[valName].test(input.value)) :
                        Util.error('A validator or regex has not been set for  "' + valName + '"');

                return this;
            };

        this.input = function(input){

            options.onBeforeValidateElement(input);
            var defs = [], 
                list = input.getAttribute(options.attr).split(options.ruleSeparator);

            Util.loop(list,function(i){
                defs[i] = Promise();
                var parts = this.split(options.ruleArgumentSeparator),
                    args = parts[1] ? parts[1].split(options.argumentSeparator) : [];

                validate(input, parts[0], args, function(result){
                    (result ? defs[i].resolve() : defs[i].reject(parts[0], args));
                });   
            });

            Promise.when(defs).then(function(){
                options.onInputSuccess(input);
            },function(valName, args){
                options.onInputFail(input, message(input.value, valName, args), valName, args);
            });

            return defs;
        };

        this.form = function(form){

            options.onBeforeValidateForm(form);

            for (var i = 0,  defs = [], inputs = Util.getElements('input,select,checkbox,textarea',form); i < inputs.length; ++i) {
                defs = defs.concat(this.input(inputs[i]));
            }

            Promise.when(defs).then(function(){
                options.onSuccess(form);
            },function(){
                options.onFail(form);
            });

            return defs;
        };
    },
    Util = {
        'loop' : function(o,c){for (var i = 0; i < o.length; i++) {c.call(o[i],i);}},
        'only'  : function(o,k){var t = {};for(var a in k)if(o[k[a]]) t[k[a]] = o[k[a]];return t},
        'tmpl' : function(s,a){for(var i in a){s = s.replace('{'+i+'}',a[i]);}return s},
        'extend' : function(){var e=function(t,n){for(var r in n){if(n.hasOwnProperty(r)){var i=n[r];if(t.hasOwnProperty(r)&&typeof t[r]==="object"&&typeof i==="object"){e(t[r],i)}else{t[r]=i}}}return t};var t={};for(var n=0;n<arguments.length;n++){t=e(t,arguments[n])}return t},
        'error' : function(message){throw new Error(message);},
        'getElements' : function(e,t){t=t||document;var n=e.split(",");var r=new Array;for(var i=0;i<n.length;i++){var s=t.getElementsByTagName(n[i]);for(var o=0;o<s.length;o++){r.push(s[o])}}var u=r[0];if(!u)return[];if(u.sourceIndex){r.sort(function(e,t){return e.sourceIndex-t.sourceIndex})}else if(u.compareDocumentPosition){r.sort(function(e,t){return 3-(e.compareDocumentPosition(t)&6)})}return r}
    };

    Validator.plugin = function(plugin){
        Util.extend(Validator.plugins,Util.only(plugin,['messages','regex','validators']));
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
    
    return Validator;
}();