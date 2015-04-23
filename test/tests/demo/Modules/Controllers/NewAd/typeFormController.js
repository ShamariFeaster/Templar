structureJS.module('TypeFormController', function(require){

var Route = require('Route'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    UserProfileModel = _Templar.getModel('MyProfile'),
    Config = require('Config'),
    Helper = require('Helper'),
    mixin = require('Controller.NewAd.mixin'),
    NewAdCtrl = require('Controller')( mixin );
   

/*--------- PART 3: Details -------------------*/

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  NewAdCtrl.init(AdFormMdl.adType.current_selection);
  var typeFormURL = 'TypeSpecificAdForms/';
  switch(AdFormMdl.adType.current_selection){
    case 'For Sale': 
      typeFormURL += 'for-sale.html';
      break;
    case 'Jobs': 
      typeFormURL += 'jobs.html';
      break;
    case 'Housing': 
      typeFormURL += 'housing.html';
      break;
    case 'Services': 
      typeFormURL += 'services.html';
      break;
    case 'Personals': 
      typeFormURL += 'personals.html';
      break;
    case 'Announcements': 
      typeFormURL += 'announcements.html';
      break;
    
  }
  
  NewAdCtrl.prevBtn(true,'#/new-ad/2');
  NewAdCtrl.nextBtn(true,'#/new-ad/4/id/-1/uri/-1');
  NewAdCtrl.loadPartial(typeFormURL);

});

});