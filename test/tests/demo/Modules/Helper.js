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
    }
  };
});