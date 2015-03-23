structureJS.module('Helper', function(require){

  var _ = require('Util'),
      _Templar = Templar,
      EnvModel = _Templar.getModel('Environment'),
      _$ = $;
      
  return {
    ajax : function(url, payload, cbOK, cbErr, cbFatalErr){
      if(!_.isString(url))
        return;
        
      var payload = payload || {},
          cbOK = cbOK || function(){},
          cbErr = cbErr || function(data, status, jqXHR){
            EnvModel.error = data.error;
          },
          cbFatalErr = cbFatalErr || function(data, status, jqXHR){
            EnvModel.error = 'FATAL ERROR: ' + data.responseText;
          };
      
      _$.ajax(url,{
        method : 'POST',
        data : payload,
        dataType : 'json',
        success : function(data, status, jqXHR){
          
          if(_.isNullOrEmpty(data.error)){
            cbOK.call(null, data, status, jqXHR);
          }else{
            cbErr.call(null, data, status, jqXHR);
          }
          
        },
        error : function(data, status, jqXHR){
          cbFatalErr.call(null, data, status, jqXHR);
        }
      });
    },
    
    init : function(banner, errorMsg, successMsg){
      EnvModel.banner = banner || '';
      EnvModel.error = errorMsg || '';
      EnvModel.success_msg = successMsg || '';
    },
    
    setProfileProperty : function(UserProfile, prop, fallBack){
      if(!_.isDef(UserProfile) || !_.isDef(UserProfile[prop])){
        _.log('WARNING: setProfileProperty() : "' + prop + '" not found');
        return;
      }
      UserProfile[prop] = (_.isNullOrEmpty(UserProfile[prop])) ? sessionStorage[prop] : UserProfile[prop];
      if(_.isFunc(fallBack) && _.isNullOrEmpty(UserProfile[prop])){
        fallBack.call(this, UserProfile, prop);
      }
    },
    
    loadProfile : function(UserProfile){
      if(!_.isDef(UserProfile))
        return;
        
      this.setProfileProperty(UserProfile, 'un');
      this.setProfileProperty(UserProfile, 'uid');
      this.setProfileProperty(UserProfile, 'age');
      this.setProfileProperty(UserProfile, 'city');
      this.setProfileProperty(UserProfile, 'description');
      this.setProfileProperty(UserProfile, 'fn');
      this.setProfileProperty(UserProfile, 'ln');
      this.setProfileProperty(UserProfile, 'sex');
      this.setProfileProperty(UserProfile, 'state');
      this.setProfileProperty(UserProfile, 'role');
      this.setProfileProperty(UserProfile, 'pp_src', function(UserProfile, prop){
        if(_.isNullOrEmpty(UserProfile[prop] || sessionStorage[prop])){
          this.ajax('server/profile-pic-src.php', 
            {uid: UserProfile.uid},
            function(data, status, jqXHR){
              UserProfile[prop] = data.src;
          });
        }else{
          UserProfile[prop] = sessionStorage[prop];
        }
      });
      
    }
  };
});
