structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    Controller = require('Controller'),
    P1Controller = new Controller(),
    P2Controller = new Controller(),
    NewAd = {part1 : {}, part2 : {}};   

/*--------- Part 1: Category Select  -------------------*/
P1Controller.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
};

P1Controller.bindHandlers = function(){
  var P1Controller = this;

  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    P1Controller.sortCategories();
  });
};

P1Controller.init = function(bannerMsg){

  //AdFormMdl.category = AdTypeMap.Categories[AdFormMdl.adType.current_selection];
  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

_Templar.success("#/new-ad", function(){
  P1Controller.init('Ad Category');
});

_Templar.success("#/new-ad/2", function(){
  P2Controller.init('Title & Description');
});

/*--------- PART 3: Details -------------------*/

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  P2Controller.init(AdFormMdl.adType.current_selection);
  
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