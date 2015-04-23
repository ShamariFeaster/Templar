structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('MyProfile'),
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    _$ = $;
    
_Templar.success(Config.formsDir + 'services.html', function(){

});
});