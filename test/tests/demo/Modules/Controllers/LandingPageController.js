structureJS.module('LandingPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    _$ = $;   /*stop unecessary scope lookup*/
    
_Templar.success("partials/landing-page.html", function(){
  EnvModel.error = '';
  
  $('#profile_pic').change(function(e){
    
    var formDataObj = new FormData($('#form_pp_pic')[0]);
    _.log(formDataObj);
    
    _$.ajax('server/upload-picture.php',{
      method : 'POST',
      contentType: false,       // The content type used when sending data to the server.
      cache: false,             // To unable request pages to be cached
      processData:false,        // To send DOMDocument or non processed data file it is set to false
      data : formDataObj,
      success : function(data, status, jqXHR){
        
        if(!_.isNullOrEmpty(data.error)){
          EnvModel.error = data.error;
        }else{
          _.log(data);
        }

      },
      error : function(data, status, jqXHR){
        EnvModel.error = 'FATAL: ' + data.error;
      }
    });
  });
});
    
});