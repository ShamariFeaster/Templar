Templar.dataModel('Environment',
{
  siteName :  'GenericSocialNetwork.com',
  banner : '',
  error : '',
  pw : '_Drumnba422',
  un : 'alistproducer1',
  email : 'a@b.com',
  confirm_pw : '_Drumnba422',
  validation_msgs : new Array(5),
  success_msg : '',
  pic_submission_url : 'server/upload-picture.php'
});

Templar.dataModel('ProfileForm',
{
  uploadStatus : '',
  fn : '',
  ln : '',
  states : structureJS.require('GeoInfo-US').states,
  cities : [],
  age : (function(){
          var range = [];
          for(var i = 18; i < 51; i++){ 
            range.push(i);
          }
          return range;
        })(),
  sex : [
        {description : 'Male', value : 'm', checked : true}, 
        {description : 'Female', value : 'f'}, 
        {description :'Yes Please', value : 'na'}],
  description : ''
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


