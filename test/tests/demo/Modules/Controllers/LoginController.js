structureJS.module('LoginPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    LoginFormMdl = _Templar.getModel('LoginForm'),
    Config = require('Config'),
    SelectQuery = new (require('JRDBI').QueryCollection.Select)(),
    EQ = require('JRDBI').Condition.EQ,
    _$ = window.$;   /*stop unecessary scope lookup*/

function loginHandler(e){
  Route.authenticate({
    un : LoginFormMdl.un,
    pw : LoginFormMdl.pw,
    badPassword : function(msg){
      EnvModel.error = msg;
    }
  });
  
  return false;
}

function signupHandler(e){
  Helper.ajax('sign-up.php',
    {
      username: LoginFormMdl.un,
      password : LoginFormMdl.pw,
      email : LoginFormMdl.email
    },
    function(data, status, jqXHR){
      Route.authenticate({
        un : LoginFormMdl.un,
        pw : LoginFormMdl.pw,
        landingPage : '/editProfile'
      });
    });

  return false;
}

function enableSubmission(){
    if(
      !LoginFormMdl.validation_msgs[0] && 
      !LoginFormMdl.validation_msgs[1] && 
      !LoginFormMdl.validation_msgs[2] &&
      !LoginFormMdl.validation_msgs[3] &&
      !LoginFormMdl.validation_msgs[4]
      ){
      LoginFormMdl.submissionDisabled = false;
    }
  }
  
_Templar.success("partials/login-screen.html", function(){

  _$('#loginbtn').click(loginHandler);     
  _$('#btn-sign-up').click(signupHandler);
  _$('#modaltrigger1').leanModal({ top: 110, overlay: 0.45, closeButton: ".hidemodal" });
  _$('#modaltrigger2').leanModal({ top: 110, overlay: 0.45, closeButton: ".hidemodal" });
  
  /*USername Validations*/
  function checkUnique(data){
    if(data.results.length > 0){
      LoginFormMdl.validation_msgs[4] = LoginFormMdl.un + ' Is Already In Use';
      LoginFormMdl.submissionDisabled = true;
    }else{
      LoginFormMdl.validation_msgs[4] = '';
      enableSubmission();
    }
    LoginFormMdl.update('validation_msgs');
  }
  
  function checkUnLength(e){
    if(e.text.length < 8){
      LoginFormMdl.validation_msgs[0] = 'Username Must At Least 8 Characters';
      LoginFormMdl.submissionDisabled = true;
    }else if(e.text.length > 20){
      LoginFormMdl.validation_msgs[0] = 'Username Must Be Less Than 21 Characters';
      LoginFormMdl.submissionDisabled = true;
    }else{
      LoginFormMdl.validation_msgs[0] = '';
      enableSubmission();
    }
  }
  
  /* Email validation */
  function checkEmail(e){
    if(!/.+@.+\.\w+/.test(e.text)){
      LoginFormMdl.validation_msgs[3] = 'Invalid Email Address Format';
      LoginFormMdl.submissionDisabled = true;
    }else if(e.text.length > 51){
      LoginFormMdl.validation_msgs[3] = 'Email Must Be Less Than 51 Characters';
      LoginFormMdl.submissionDisabled = true;
    }else{
      LoginFormMdl.validation_msgs[3] = '';
      enableSubmission();
    }
  }
  
  /* Password Validation */
  function checkPw(e){
    if(e.text.length < 8){
      LoginFormMdl.validation_msgs[1] = 'Password Must Be At Least 8 Characters';
      LoginFormMdl.submissionDisabled = true;
    }else if(e.text.length > 20){
      LoginFormMdl.validation_msgs[1] = 'Password Must Be Less Than 26 Characters';
      LoginFormMdl.submissionDisabled = true;
    }else{
      LoginFormMdl.validation_msgs[1] = '';
      enableSubmission();
    }
  }
  
  function checkConfirmPw(e){
    if((!e.text && !LoginFormMdl.pw) || e.text != LoginFormMdl.pw){
      LoginFormMdl.validation_msgs[2] = 'Password And Confirm Password Don\'t Match';
      LoginFormMdl.submissionDisabled = true;
    }else{
      LoginFormMdl.validation_msgs[2] = '';
      enableSubmission();
    }
  }
  LoginFormMdl.listen('un', function(e){
  
    SelectQuery
      .fields({un : true})
      .condition( EQ('un',LoginFormMdl.un) )
      .execute('acct', checkUnique);

    checkUnLength(e);
    LoginFormMdl.update('validation_msgs');
  });
  
  LoginFormMdl.listen('email', function(e){
    checkEmail(e);
    LoginFormMdl.update('validation_msgs');
  });
  
  LoginFormMdl.listen('pw', function(e){
    checkPw(e);
    LoginFormMdl.update('validation_msgs');
  });
  
  LoginFormMdl.listen('confirm_pw', function(e){
    checkConfirmPw(e);
    LoginFormMdl.update('validation_msgs');
  });
  
});
    
    
});

    



