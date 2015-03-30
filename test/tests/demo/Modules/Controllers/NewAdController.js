structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    NewAd = {part1 : {}, part2 : {}};   

/*--------- Part 1: Category Select  -------------------*/
NewAd.part1.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
};

NewAd.part1.bindHandlers = function(){
  var NewAd = this;
  
  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    NewAd.sortCategories();
  });
};

NewAd.part1.init = function(bannerMsg){
  Helper.init(bannerMsg);
  this.bindHandlers();
  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

_Templar.success("#/new-ad", function(){
  NewAd.part1.init('Ad Category');
});

_Templar.success("#/new-ad/2", function(){
  Helper.init('Title & Description');
});

/*--------- PART 3: Details -------------------*/
NewAd.part2.bindHandlers = function(){};

NewAd.part2.init = function(bannerMsg){
  Helper.init(bannerMsg);
  this.bindHandlers();
};

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  NewAd.part2.init(AdFormMdl.adType.current_selection);
  
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