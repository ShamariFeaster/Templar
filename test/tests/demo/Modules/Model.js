Templar.dataModel('Environment',
{
  siteName :  'SellShit.com',
  error : '',
  pw : '_Drumnba422',
  un : 'alistproducer1',
  email : 'a@b.com',
  confirm_pw : '_Drumnba422',
  validation_msgs : new Array(5),
  pic_submission_url : 'server/upload-picture.php'
});

Templar.dataModel('LandingPage',
{
  title :  'Profile',
  msg : 'Please Upload Your Proile Picture.',
  uploadStatus : '',
  states : structureJS.require('GeoInfo-US').states,
  cities : [],
  age : (function(){
          var range = [];
          for(var i = 18; i < 51; i++){ 
            range.push(i);
          }
          return range;
        })(),
  sex : ['Male', 'Female', 'Yes Please']
});
            
            
Templar.dataModel('UserProfile',
{
  un :  '',
  uid : '',
  email : '',
  fn : '',
  ln : '',
  pw : '',
  pp_src : ''
});


