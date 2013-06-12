JSValidation
============

A framework independent JavaScript Validation Library

Please note that jQuery is NOT required. It is used only for event handling and dom manipulation in this specific example.

```html
<html>
    <head>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
        <script src="validate.min.js"></script>
        <script>
            (function(){
                // timer simulates xjax call. In practise this object would be the previous xhr request. 
                // xhr.stop() should be called to avoid resolution of multiple deferred objects from overlapping validate calls
                var timer;
                
                // Global plugins can be added as follows
                Validator.plugin({
                    validators : {
                        unique : function(callback){
                            var value = this.value;
                            clearTimeout(timer)
                            timer = setTimeout(function(){
                                callback(value != 'joe@example.com');
                            },1000);
                        }
                    },
                    // there is a "regex" validator built right in, just add named regexes (validators of the same name take priority)
                    regex : {
                        strongpassword : /^(?=.*(\d|\W)).{5,20}$/
                    },

                    // add error messages to be shown when the corresponding regex or validator fails
                    messages : {
                        unique : 'The email address "{value}" is already in use',
                        strongpassword : 'Your password is not strong enough. Please enter another.'
                    }
                });
            })();
        </script>
        <script>

            $(function(){   
                
                var val = new Validator({
                    // Per instance validators can be added like this
                    messages : {
                        'five' : 'Please set the value of this field to 5'
                    },
                    validators : {
                        'five' : function(callback){
                            callback(parseInt(this.value) === 5);
                        }
                    },
                    onBeforeValidateElement : function(input){
                        $(input).parent().find('.success-form,.error-form').remove();
                    },
                    onInputSuccess : function(input){
                        $(input).after('<span class="success-form">OK</span>');
                    },
                    onInputFail : function(input,message,validatorName,args){
                        $(input).after('<span class="error-form">'+message+'</span>');
                    }
                });
                
                $('form').submit(function(e){
                    e.preventDefault();
                    val.form(this);
                    
                    // After first submission, validate on keyup/change
                    $('form input').unbind('.val').on('keyup.val change.val',function(){
                        val.input(this);
                    });
                    
                });
            });
        </script>
        <style>
            
            label,input,textarea,.success-form,.error-form {
                display:block;
                width:150px;
                padding:5px;
                float:left;
            }
            .success-form,.error-form {
                padding:4px;
                border: 1px solid;
                width:400px;
                margin-left:10px;
            }
            .success-form {
                color:#339900;
                border-color:#339900;
            }
            .error-form {
                color:#cc0000;
                border-color:#cc0000;
            }
            div{
                clear:both;
            }
        </style>
    </head>
    <body>
        <form>
            
            <div><label>Password</label> <input data-validate="required minlength:8 strongpassword"/></div>
            <div><label>Username</label> <input data-validate="required alnumextended"/></div>
            <div><label>Email</label> <input data-validate="required email unique"/></div>
            <div><label>Price</label> <input data-validate="required number positive"/></div>
            <div><label>Enter the number 5</label> <input data-validate="required five"/></div>
            <div><label>Minimum Value</label> <input data-validate="required number negative min:-20"/></div>
            <div><label>Telephone (optional)</label> <input data-validate="required telephone"/></div>
            <div><label>Agree</label> <input type="checkbox" data-validate="required checked"></div>
            <div><button>Submit</button></div>
        </form>
    </body>
    
</html>

```
