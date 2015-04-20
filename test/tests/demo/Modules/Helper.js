structureJS.module('Helper', function(require){

  var _ = require('Util'),
      _Templar = Templar,
      EnvModel = _Templar.getModel('Environment'),
      UserProfileModel = _Templar.getModel('UserProfile'),
      Config = require('Config'),
      SelectQuery = new (require('JRDBI').QueryCollection.Select)(),
      EQ = require('JRDBI').Condition.EQ,
      _$ = $;
      
  return {
    ajax : function(url, payload, cbOK, cbErr, cbFatalErr){
      if(!_.isString(url))
        return;
      url = (Config.SERVER_DEBUG == true) ? url + '?XDEBUG_SESSION_START=name' : url;
      var payload = payload || {},
          cbOK = cbOK || function(data){
            EnvModel.success_msg = data;
          },
          cbErr = cbErr || function(data, status, jqXHR){
            EnvModel.error = data.error;
          },
          cbFatalErr = cbFatalErr || function(data, status, jqXHR){
            EnvModel.error = 'FATAL ERROR: ' + data.responseText;
          };
      
      _$.ajax(Config.serverRoot + url,{
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
      this.loadProfile(UserProfileModel);
    },
    
    setProfileProperty : function(UserProfile, prop, fallBack){
      if(!_.isDef(UserProfile) || !_.isDef(UserProfile[prop])){
        _.log('WARNING: setProfileProperty() : "' + prop + '" not found');
      }else{
        UserProfile[prop] = (_.isNullOrEmpty(UserProfile[prop])) ? sessionStorage[prop] : UserProfile[prop];
        if(_.isFunc(fallBack) && _.isNullOrEmpty(UserProfile[prop])){
          fallBack.call(this, UserProfile, prop);
        }
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
          SelectQuery
            .fields({profile_pic_uri: true})
            .condition(EQ('uid',UserProfile.uid))
            .execute('people', function(data){
              UserProfile[prop] = Config.ppPicDir + data.results[0].profile_pic_uri;
            });

        }else{
          UserProfile[prop] = sessionStorage[prop];
        }
      });
      
    },
    
    isChecked : function(model, attribName, index){
      if(!model[attribName] || !model[attribName].checked)
        return false;
      var index = (_.isDef(index)) ? index : 0;
      return (model[attribName].checked[index] == true);
    },
    
    areAnyChecked : function(model, attribName){
      var anyChecked = false;
      for(var i in model[attribName].checked){
        anyChecked |= model[attribName].checked[i];
      }
      return anyChecked;
    },
    
    getCheckedVals : function(model, attribName){
      var checkedVals = [];
      for(var i in model[attribName].checked){
        if(model[attribName].checked[i]){
          if(_.isInt(i)){
            checkedVals.push(
            (_.isDef(model[attribName][i].value)) ?
              model[attribName][i].value :
              model[attribName][i]
            )
          }
        };
      }
      
      return checkedVals;
    },
    
    parseDate : function(dateStr){
      var retVal = null;
      if(!_.isNullOrEmpty(dateStr) && /\d{1,4}[\/\-]+\d{1,2}[\/\-]+\d{1,4}/.test(dateStr)){
        var time = new Date(),
            dateSplit = dateStr.split(/[\/\-]/).sort(
              /*pushes 4 digit year to the end of array*/
              function(a,b){ 
                if(a.length == 4)
                  return 1;
                if(b.length == 4)
                  return -1
                
                return 0;
              }),
            date = dateSplit[2] + '-' + dateSplit[0] + '-' + dateSplit[1];
        retVal = date + ' ' + time.getHours() + ':' + 
                time.getMinutes() + ':' + time.getSeconds();
      }
      
      return retVal;
    },
    
    todayPlusXDays : function(xDays){
      var date = new Date(),
          months, days, output = ['','',''];
      if(_.isInt(xDays)){
        months = xDays/30;
        days = xDays%30;
        date.setMonth( date.getMonth() + months + 1 );
        date.setDate( date.getDate() + days );
      }
      output[0] = date.getMonth();
      output[1] = date.getDate();
      output[2] = date.getFullYear();
      return this.parseDate(output.join('/'));
    },
    
    elipsis : function(str, maxLength){
      var maxLength = (_.isDef(length)) ? maxLength : 15,
          str = (_.isString(str)) ? str : '',
          elipsis = '...';
      return (str.length > maxLength) ? 
              str.substr(0, maxLength) + elipsis : str;
    },
    
    formatDate : function(mySqlDatestamp){
      var date = new Date(mySqlDatestamp);
      return [(date.getMonth()+1),date.getDate(),date.getFullYear()].join('/');
    },
    fadeInSuccessMsg : function(msg){
      $('#success-msg').hide();
      EnvModel.success_msg = msg;
      $('#success-msg').fadeIn(1750).fadeOut(1750, function(){
        EnvModel.success_msg = '';
      });
    },
    
    fadeInErrorMsg : function(msg){
      $('#error-msg').hide();
      EnvModel.error = msg;
      $('#error-msg').fadeIn(1750);
    },
    
    pushAdPic : function(uri, id){
      var cfg = require('Config'),
          mdl = window.Templar.getModel('AdForm');
      mdl.ad_images.push({src : cfg.adPicDir + uri, id : id});
      mdl.update('ad_images');
    },
    
    getAd : function(ads, id){
      var ads = ads.filter(
            function(item){ return item.ad_id == id;}
          );
      return ads[0];
    }
  };
});


/* ------------------------------------------------------------------------- */

