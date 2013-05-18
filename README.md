JSValidation
============

A framework independent JavaScript Validation Library
```html
<html>
    <head>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
        <script src="validate.js"></script>
        <script>

            $(function(){   
                // timer simulates xjax call. In practise this object would be the previous xhr request. 
                // xhr.stop() should be called to avoid resolution of multiple deferred objects from overlapping validate calls
                var timer;
                
                var val = new Validator({
                    validators : {
                        unique : function(callback){
                            var value = this;
                            clearTimeout(timer)
                            timer = setTimeout(function(){
                                callback(value != 'joe@example.com');
                            },1000);
                        }
                    },
                    regex : {
                        
                    },
                    messages : {
                        unique : 'The email address "{value}" is already in use'
                    },
                        
                    onBeforeValidateElement : function(obj){
                        $(obj).parent().find('.success-form,.error-form').remove();
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
                        val.element(this);
                    });
                    
                });
            });
        </script>
        <style>
            
            label,input,.success-form,.error-form {
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
            
            <div><label>Password</label> <input data-validate="required minlength:5"/></div>
            <div><label>Email</label> <input data-validate="required email unique"/></div>
            <div><label>Price</label> <input data-validate="required float positive"/></div>
            <div><label>Minimum Value</label> <input data-validate="required float negative min:-20"/></div>
            <div><label>Telephone (optional)</label> <input data-validate="telephone"/></div>
            <div><button>Submit</button></div>
        </form>
    </body>
    
</html>

```