structureJS.module('LoginPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    _$ = $;   /*stop unecessary scope lookup*/

_Templar.success("partials/login-screen.html", function(){

  _$('#loginform').submit(function(e){

    Route.authenticate({
      un : EnvModel.un,
      pw : EnvModel.pw,
      landingPage : '/landingPage',
      badPassword : function(msg){
        EnvModel.error = msg;
      }
    });
    
    
    return false;
  });
  var $formSignUp = _$('#form-sign-up'),
      $btnSignUp = _$('#btn-sign-up');
      
  $formSignUp.submit(function(e){
    
    _$.ajax('server/sign-up.php',{
      method : 'POST',
      dataType : 'json',
      data : {username: EnvModel.un,
              password : EnvModel.pw,
              email : EnvModel.email},
      success : function(data, status, jqXHR){
        
        if(!_.isNullOrEmpty(data.error)){
          EnvModel.error = data.error;
        }else{
          Route.authenticate({
            un : EnvModel.un,
            pw : EnvModel.pw,
            landingPage : '/landingPage'
          });
        
        }

      },
      error : function(data, status, jqXHR){
        EnvModel.error = 'FATAL: ' + data.error;
      }
    });

    return false;
  });
  
  function enableSubmission(){
    if(
      !EnvModel.validation_msgs[0] && 
      !EnvModel.validation_msgs[1] && 
      !EnvModel.validation_msgs[2] &&
      !EnvModel.validation_msgs[3] &&
      !EnvModel.validation_msgs[4]
      ){
      $btnSignUp.prop('disabled',false);
    }
  }
  
  EnvModel.listen('un', function(e){
    $.ajax('server/check-unique.php',{
      method : 'POST',
      data : {username: EnvModel.un},
      
      success : function(data, status, jqXHR){
        if(data < 1){
          EnvModel.validation_msgs[4] = EnvModel.un + ' Is Already In Use';
          $btnSignUp.prop('disabled',true);
        }else{
          EnvModel.validation_msgs[4] = '';
          enableSubmission();
        }
        
        EnvModel.update('validation_msgs');
      },
      error : function(data, status, jqXHR){
        EnvModel.error = 'FATAL: ' + data.error;
      }
    });
  
    if(e.text.length < 8){
      EnvModel.validation_msgs[0] = 'Username Must At Least 8 Characters';
      $btnSignUp.prop('disabled',true);
    }else if(e.text.length > 20){
      EnvModel.validation_msgs[0] = 'Username Must Be Less Than 21 Characters';
      $btnSignUp.prop('disabled',true);
    }else{
      EnvModel.validation_msgs[0] = '';
      enableSubmission();
    }
    EnvModel.update('validation_msgs');
  });
  
  EnvModel.listen('email', function(e){
    if(!/.+@.+\.\w+/.test(e.text)){
      EnvModel.validation_msgs[3] = 'Invalid Email Address Format';
      $btnSignUp.prop('disabled',true);
    }else if(e.text.length > 51){
      EnvModel.validation_msgs[3] = 'Email Must Be Less Than 51 Characters';
      $btnSignUp.prop('disabled',true);
    }else{
      EnvModel.validation_msgs[3] = '';
      enableSubmission();
    }
    EnvModel.update('validation_msgs');
  });
  
  EnvModel.listen('pw', function(e){
    if(e.text.length < 8){
      EnvModel.validation_msgs[1] = 'Password Must Be At Least 8 Characters';
      $btnSignUp.prop('disabled',true);
    }else if(e.text.length > 20){
      EnvModel.validation_msgs[1] = 'Password Must Be Less Than 26 Characters';
      $btnSignUp.prop('disabled',true);
    }else{
      EnvModel.validation_msgs[1] = '';
      enableSubmission();
    }
    EnvModel.update('validation_msgs');
  });
  
  EnvModel.listen('confirm_pw', function(e){
    if((!e.text && !EnvModel.pw) || e.text != EnvModel.pw){
      EnvModel.validation_msgs[2] = 'Password And Confirm Password Don\'t Match';
      $btnSignUp.prop('disabled',true);
    }else{
      EnvModel.validation_msgs[2] = '';
      enableSubmission();
    }
    EnvModel.update('validation_msgs');
  });
  
  $('#modaltrigger1').leanModal({ top: 110, overlay: 0.45, closeButton: ".hidemodal" });
  $('#modaltrigger2').leanModal({ top: 110, overlay: 0.45, closeButton: ".hidemodal" });
});
    
});

    



