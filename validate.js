var Validate = function(obj,options,validators){
    /**
    * a set of rules for front end validation
    * matches classes of val-'ruleName' where rule name can be:
    * 
    * email
    * required
    * (please contribute)
    */
  	
    var validators = $.extend({
        email : {
            name : 'email',
            validator:function(){
                var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter a valid email address'
        },
        url : {
            name : 'url',
            validator:function(){
                var filter = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                return !this.length || filter.test(this);
            },
            message : 'Please enter a valid website address'
        },
        alpha : {
            name : 'alpha',
            validator:function(){
                var filter = /^[A-Za-z]+$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter only alphabetic characters'
        },
        integer : {
            name : 'integer',
            validator:function(){
                var filter = /^[0-9]+$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter only numbers'
        },
        alnum : {
            name : 'alnum',
            validator:function(){
                var filter = /^[A-Za-z0-9]+$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter only alphanumeric characters'
        },
        alnumextended : {
            name : 'alnumextended',
            validator:function(){
                var filter = /^[A-Za-z0-9_-]+$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter only A-Z 0-9 _ - characters'
        },
        telephone : {
            name : 'telephone',
            validator : function(){
                var filter = /^(?:\((\+?\d+)?\)|\+?\d+) ?\d*(-?\d{2,3} ?){0,4}$/;
                return !this.length || filter.test(this);
            },
            message : 'Please enter a valid telephone number'
        },
        required : {
            name : 'required',
            validator:function(){
                return !/^\s*$/.test(this);
            },
            message : 'Please fill out this field'
        },
        strlen : {
            name : 'strlen',
            validator:function(size){
                if(typeof size !== 'undefined'){
                    if(this.length == size){
                        validators.strlen.tmpmessage = validators.strlen.tmpmessage || validators.strlen.message;
                        validators.strlen.message = validators.strlen.tmpmessage +' is exactly '+size+' characters';
                        return false;
                    }
                }
                return true;
            },
            message : 'Please check the length'
        },
        min : {
            name : 'min',
            validator:function(min){
                if(typeof min !== 'undefined'){
                    if(this.length > 0 && this.length < min){
                        validators.min.tmpmessage = validators.min.tmpmessage || validators.min.message;
                        validators.min.message = validators.min.tmpmessage +' is at least '+min+' characters'
                        return false;
                    }
                }
                return true;
            },
            message : 'Please check the length'
        }
    },validators);
		
    var options = $.extend({
        dataattr : 'data-validate'
    },options);
				
    //this.successElements = [];
    var errorElements = [];
    
    this.run = function(){
        $(obj).each(function(){
            var inp = $(this);
            var validatorsList = inp.attr(options.dataattr).split(/\s+/);
            $.each(validators,function(key,rule){

                for (var i = 0; i < validatorsList.length; i++) {
                    var validator = validatorsList[i].replace(/:(.+)$/,'').replace('val-',''); //val- for legacy
                    var args = validatorsList[i].replace(/^(.+):/,'');
                    if(args !== null){
                        args = args.split(',');
                    }else{
                        args = []; // IE 7+8 fix. Args cannot be null
                    }

                    if (validator === key) {
                        if(!rule.validator.apply(inp.val(),args)){
                            (function(inp,rule){
                                errorElements.push([inp,rule]);
                            })(inp,rule)
                            return false; //break out so we only show one message at a time
                        }
                    }
                }
            })
        });
        this.errorElements = errorElements;
        return (this.errorElements.length == 0);
    }
        
}

var Validator = function(){
    
    var messages = {
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
        empty   : 'Please do not fill out this field'
    };
    
    var message = function(validatorName,args){
        if(messages[validatorName]){
            var interpolated = messages[validatorName];
            for(var a in args){
                interpolated = interpolated.replace('{'+a+'}',args[a]);
            }
            return interpolated;
        }
        console.log('A message for validator "' + validatorName + '" does not exist.');
    };

    
    var regex = {
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
    };
    
    var base = function(validatorName){
        if(regex[validatorName]){
            return !this.length || regex[validatorName].test(this);
        }
        console.log('A regex for validator "' + validatorName + '" does not exist.');
    };
    
    var validators = {
        required :function(){
            return !regex.required.test(this);
        },
        length : function(size){
            return this.length == size;
        },
        minlength : function(size){
            return this.length >= size;
        },
        maxlength : function(size){
            return this.length <= size;
        }
    };

    this.validate = function(value, validatorName, args){
        return (validators[validatorName] ? validators[validatorName] : base).apply(value,args);
    };
    
    this.addRegex = function(name, regex){
        if(typeof name === 'object'){
            for(var a in name){
                this.addRegex(a,name[a]);
            }
            return;
        }

        regex[name] = regex;
    };
    
    this.addValidator = function(name, validator){
        if(typeof name === 'object'){
            for(var a in name){
                this.addValidator(a,name[a]);
            }
            return;
        }

        validators[name] = validator;
    };
    
    this.addMessage = function(name, message){
        if(typeof name === 'object'){
            for(var a in name){
                this.addMessage(a,name[a]);
            }
            return;
        }

        messages[name] = message;
    };
    
    this.element = function(obj){
        
        var validatorsList = obj.getAttribute(dataattr).split(/\s+/);
        
        for (var i = 0; i < validatorsList.length; i++) {
            
            var validatorName = validatorsList[i].replace(/:(.+)$/,'');
            
            var args = validatorsList[i].replace(/^(.+):/,'').split(',') || []; // IE 7+8 fix. Args cannot be null

            validator.run(obj.value,validatorName,args);
        }
    };
};
