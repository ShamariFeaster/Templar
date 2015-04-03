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
  pic_submission_url : Config.serverRoot + 'upload-picture.php',
  ad_pic_submission_url : Config.serverRoot + 'upload-ad-picture.php'
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
  title : '1997 BMW Z3',
  description : 'The BMW Z3 was the first modern mass-market roadster produced by BMW, as well as the first new BMW model assembled in the United States.' + 
              'The Z in Z3 originally stood for Zukunft (German for future). The Z3 was introduced via video press release by BMW North America on June 12, 1995, as a 1996 model year vehicle. It was later featured in the James Bond movie in November 1995, GoldenEye in which a blue prototype was provided for filming in late January 1995 at the Leavesden Aerodrome.[4][5] At that time Karen Sortito created the BMW campaign for the film GoldenEye.[6] Afterwards, while the film was number one at the box office, sales of the car spiked. The entire 1996 BMW Z3 roadster production run, more than 15,000 roadsters, was sold out by the time the car was introduced.[7]' +
              'There were a few variants of the car before its production run ended in 2002, including a coupé version for 1999. It was manufactured and assembled in Greer, South Carolina. The Z3 was replaced by the BMW Z4 introduced in late 2002 at the Paris Auto Show. The BMW Z Series are a line of roadsters considered to be successor to the BMW 507.',
  adType : AdTypes,
  category : Categories[AdTypes[0]],
  uploadedImages : [],
  isItemFree : [{description : 'Free? (check for yes)' , checked : false}],
  useMyLocation : [{description : 'Use My Saved Location? (check for yes)', checked : true}],
  useCustomCity : [{description : 'Other City? (check for yes)?', checked : false}],
  shouldExpire : [{description : 'Ad Expires? (check for yes)?', checked : false}],
  customCity : '',
  expiryDate : '',
  contactMethods : ['Call/Text','Email','Private Message'],
  shouldSavePhoneNumber : [{description : 'Save # To Profile? (check for yes)?', checked : true}],
  phoneNumber : '',
  disablePriceField : false,
  disablePicSubmission : false,
  itemPrice : '5500',
  categoryFormId : Config.categoryFormId,
  image_uri : '',
  image_id : '',
  ad_images : [],
  descriptionClass : ''
  
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
