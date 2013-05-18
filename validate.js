var Validator = function(options){
    
    var self = this,
    
        Deferred=function(){function e(e){return Object.prototype.toString.call(e)==="[object Array]"}function t(t,n){if(e(t)){for(var r=0;r<t.length;r++){n(t[r])}}else n(t)}function n(r){var i="pending",s=[],o=[],u=[],a=null,f={done:function(){for(var t=0;t<arguments.length;t++){if(!arguments[t]){continue}if(e(arguments[t])){var n=arguments[t];for(var r=0;r<n.length;r++){if(i==="resolved"){n[r].apply(this,a)}s.push(n[r])}}else{if(i==="resolved"){arguments[t].apply(this,a)}s.push(arguments[t])}}return this},fail:function(){for(var t=0;t<arguments.length;t++){if(!arguments[t]){continue}if(e(arguments[t])){var n=arguments[t];for(var r=0;r<n.length;r++){if(i==="rejected"){n[r].apply(this,a)}o.push(n[r])}}else{if(i==="rejected"){arguments[t].apply(this,a)}o.push(arguments[t])}}return this},always:function(){return this.done.apply(this,arguments).fail.apply(this,arguments)},progress:function(){for(var t=0;t<arguments.length;t++){if(!arguments[t]){continue}if(e(arguments[t])){var n=arguments[t];for(var r=0;r<n.length;r++){if(i==="pending"){u.push(n[r])}}}else{if(i==="pending"){u.push(arguments[t])}}}return this},then:function(){if(arguments.length>1&&arguments[1]){this.fail(arguments[1])}if(arguments.length>0&&arguments[0]){this.done(arguments[0])}if(arguments.length>2&&arguments[2]){this.progress(arguments[2])}},promise:function(e){if(e==null){return f}else{for(var t in f){e[t]=f[t]}return e}},state:function(){return i},debug:function(){console.log("[debug]",s,o,i)},isRejected:function(){return i==="rejected"},isResolved:function(){return i==="resolved"},pipe:function(e,r,i){return n(function(n){t(e,function(e){if(typeof e==="function"){l.done(function(){var t=e.apply(this,arguments);if(t&&typeof t==="function"){t.promise().then(n.resolve,n.reject,n.notify)}else{n.resolve(t)}})}else{l.done(n.resolve)}});t(r,function(e){if(typeof e==="function"){l.fail(function(){var t=e.apply(this,arguments);if(t&&typeof t==="function"){t.promise().then(n.resolve,n.reject,n.notify)}else{n.reject(t)}})}else{l.fail(n.reject)}})}).promise()}},l={resolveWith:function(e){if(i==="pending"){i="resolved";var t=a=arguments.length>1?arguments[1]:[];for(var n=0;n<s.length;n++){s[n].apply(e,t)}}return this},rejectWith:function(e){if(i==="pending"){i="rejected";var t=a=arguments.length>1?arguments[1]:[];for(var n=0;n<o.length;n++){o[n].apply(e,t)}}return this},notifyWith:function(e){if(i==="pending"){var t=a=arguments.length>1?arguments[1]:[];for(var n=0;n<u.length;n++){u[n].apply(e,t)}}return this},resolve:function(){return this.resolveWith(this,arguments)},reject:function(){return this.rejectWith(this,arguments)},notify:function(){return this.notifyWith(this,arguments)}};var c=f.promise(l);if(r){r.apply(c,[c])}return c}n.when=function(){if(arguments.length<2){var e=arguments.length?arguments[0]:undefined;if(e&&typeof e.isResolved==="function"&&typeof e.isRejected==="function"){return e.promise()}else{return n().resolve(e).promise()}}else{return function(e){var t=n(),r=e.length,i=0,s=new Array(r);for(var o=0;o<e.length;o++){(function(n){e[n].done(function(){s[n]=arguments.length<2?arguments[0]:arguments;if(++i==r){t.resolve.apply(t,s)}}).fail(function(){t.reject(arguments)})})(o)}return t.promise()}(arguments)}};return n}(),
    
        Util = {
            interpolate : function(s,a){for(var i in a){s = s.replace('{'+i+'}',a[i]);}return s},
            extend : function(e,t){for(var n in t){if(t.hasOwnProperty(n)){var r=t[n];if(e.hasOwnProperty(n)&&typeof e[n]==="object"&&typeof r==="object"){Util.extend(e[n],r)}else{e[n]=r}}}return e},
            error : function(message){throw new Error(message);}
        };
    
    options = Util.extend({

        attr : 'data-validate',
        
        ruleSeparator : /\s+/,
        
        ruleArgumentSeparator : ':',
        
        argumentSeparator : ',',

        onBeforeValidateElement : function(obj){},
        onBeforeValidateForm : function(form){},
        onInputSuccess : function(input,message,validatorName,args){},
        onInputFail : function(input,message,validatorName,args){},
        onSuccess : function(form){
            form.submit();
        },
        onFail : function(form){},
        
        defaultMessage : 'Please check this field for errors',
        
        messages : {
            email   : 'Please enter a valid email address',
            url     : 'Please enter a valid URL',
            alpha   : 'Please enter only alphabetic characters',
            alnum   : 'Please enter only alphabetic characters',
            alnumextended : 'Please enter only A-Z 0-9 _ - characters',
            integer     : 'Please enter only whole integers',
            float       : 'Please enter a number',
            positive    : 'Please enter a positive number',
            negative    : 'Please enter a negative number',
            telephone   : 'Please enter a valid telephone number',
            required    : 'Please fill out this field',
            length      : 'Please ensure the value is exactly {0} characters in length',
            minlength   : 'Please ensure the value is greater than {0} characters in length',
            maxlength   : 'Please ensure the value is less than {0} characters in length',
            empty   : 'Please do not fill out this field',
            min     : 'Please enter a number greater than or equal to {0}',
            max     : 'Please enter a number less than or equal to {0}'
        },

        regex : {
            email   : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            url     : /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
            alpha   : /^[A-Za-z]+$/,
            alnum   : /^[A-Za-z0-9]+$/,
            alnumextended : /^[A-Za-z0-9_-]+$/,
            integer     : /^\s*(\+|-)?\d+\s*$/,
            float       : /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/,
            telephone   : /^(?:\((\+?\d+)?\)|\+?\d+) ?\d*(-?\d{2,3} ?){0,4}$/,
            required    : /^\s*$/,
            empty   : /^$/
        },

        validators : {
            positive : function(callback){
                callback(options.regex.float.test(this) && this >= 0);
            },
            negative : function(callback){
                callback(options.regex.float.test(this) && this <= 0);
            },
            min : function(min,callback){
                callback(options.regex.float.test(this) && this >= parseFloat(min));
            },
            max : function(max,callback){
                callback(options.regex.float.test(this) && this <= parseFloat(max));
            },
            required :function(callback){
                callback(!options.regex.required.test(this));
            },
            length : function(size,callback){
                callback(this.length == size);
            },
            minlength : function(size,callback){
                callback(this.length >= size);
            },
            maxlength : function(size,callback){
                callback(this.length <= size);
            }
        }
    },options);
    
    
    
    this.message = function(value,valName,args){
        var message = options.messages[valName] ? options.messages[valName] : options.defaultMessage;
        return Util.interpolate(message.replace('{value}',value),args);  
    };

    this.validate = function(value, valName, args, callback){
        
        var tmp = args.slice(0); 
        tmp.push(callback);
        
        options.validators[valName] ?
            options.validators[valName].apply(value,tmp) : 
            options.regex[valName] ?
                callback(!value.length || options.regex[valName].test(value)) :
                Util.error('A validator or regex has not been set for  "' + valName + '"');
        
        return this;
    };

    this.element = function(obj){
        
        options.onBeforeValidateElement(obj);
        
        for (var i = 0, defs = [], list = obj.getAttribute(options.attr).split(options.ruleSeparator); i < list.length; i++) {
            
            defs[i] = Deferred();
            
            var parts = list[i].split(options.ruleArgumentSeparator);
 
            (function(i,valName,args){
                
                self.validate(obj.value, valName, args, function(result){
                    (result ? defs[i].resolve(valName, args) : defs[i].reject(valName, args));
                });
                
            })(i,parts[0], parts[1] ? parts[1].split(options.argumentSeparator) : []);          
            
        }

        var when = Deferred.when.apply(this,defs);

        when.always(function(arg){
            var func = when.state() === 'resolved' ? options.onInputSuccess : options.onInputFail;
            func && func(obj, self.message(obj.value, arg[0], arg[1]), arg[0], arg[1]);
        });
        
        return defs;
    };
    
    this.form = function(form){

        options.onBeforeValidateForm(form);

        var inputs = form.getElementsByTagName('input');
        
        var defs = [];
        
        for (var i = 0; i < inputs.length; ++i) {
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