structureJS.module('TypeFormController', function(require){

var Route = require('Route'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    Config = require('Config'),
    Controller = require('Controller')();   

/*--------- PART 3: Details -------------------*/

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  Controller.init(AdFormMdl.adType.current_selection);
  
  switch(AdFormMdl.adType.current_selection){
    case 'For Sale': 
      Route.openPartial(Config.formsDir + 'for-sale.html'
                        ,Config.categoryFormId);
      break;
    case 'Jobs': 
      Route.openPartial(Config.formsDir + 'jobs.html'
                        ,Config.categoryFormId);
      break;
    case 'Housing': 
      Route.openPartial(Config.formsDir + 'housing.html'
                        ,Config.categoryFormId);
      break;
    case 'Services': 
      Route.openPartial(Config.formsDir + 'services.html'
                        ,Config.categoryFormId);
      break;
    case 'Personals': 
      Route.openPartial(Config.formsDir + 'personals.html'
                        ,Config.categoryFormId);
      break;
    case 'Announcements': 
      Route.openPartial( Config.formsDir + 'announcements.html'
                        ,Config.categoryFormId);
      break;
    
  }
});

});