structureJS.module('Model', function(require){

var AdTypes = require('Type-Category-Map').AdTypes,
    Categories = require('Type-Category-Map').Categories,
    Config = require('Config'),
    States = structureJS.require('GeoInfo-US').states,
    Cities = structureJS.require('GeoInfo-US').city_map;

Templar.dataModel('Environment',
{
  siteName :  'GenericSocialNetwork.com',
  banner : '',
  error : '',
  success_msg : '',
  pic_submission_url : 'server/upload-picture.php'
});

Templar.dataModel('LoginForm',
{
  pw : '_Drumnba422',
  un : 'alistproducer1',
  email : 'a@b.com',
  confirm_pw : '_Drumnba422',
  validation_msgs : new Array(5),
  submissionDisabled : true
});

Templar.dataModel('ProfileForm',
{
  uploadStatus : '',
  fn : '',
  ln : '',
  states : States,
  cities : Cities[States[0]],
  age : (function(){
          var range = [];
          for(var i = 18; i < 51; i++){ range.push(i); }
          return range;
        })(),
  sex : [
        {description : 'Male', value : 'm', checked : true}, 
        {description : 'Female', value : 'f'}, 
        {description :'Yes Please', value : 'na'}],
  description : ''
});

Templar.dataModel('AdForm',
{
  title : '',
  description : '',
  adType : AdTypes,
  category : Categories[AdTypes[0]],
  uploadedImages : [],
  isItemFree : [{description : 'Free (check for yes)?' , checked : true}],
  useMyLocation : [{description : 'Use My Saved Location? (check for yes)?', checked : true}],
  useCustomCity : [{description : 'Other City? (check for yes)?', checked : false}],
  customCity : '',
  disablePriceField : false,
  itemPrice : '',
  categoryFormId : Config.categoryFormId,
  ln : '',
  age : (function(){
          var range = [];
          for(var i = 18; i < 51; i++){ range.push(i); }
          return range;
        })(),
  sex : [
        {description : 'Male', value : 'm', checked : true}, 
        {description : 'Female', value : 'f'}, 
        {description :'Yes Please', value : 'na'}]
  
});
            
Templar.dataModel('UserProfile',
{
  un :  '',
  uid : '',
  email : '',
  fn : '',
  ln : '',
  state : '',
  city : '',
  age : '',
  sex : '',
  role : '',
  description : '',
  pp_src : ''
});

});
