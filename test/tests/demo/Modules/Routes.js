Templar.Route([
/*---LOGIN---*/
{
    route : '#/login',
    partial : 'partials/login-screen.html'
},
/*---EDIT PROFILE---*/
{
    route : '#/editProfile',
    partial : 'partials/edit-profile.html'
},
{
    route : '#/editProfile/ProfileForm:uploadStatus/',
    partial : 'partials/edit-profile.html'
},
/*---PROFILE---
  Best practice is not to use apl-default's. Uee UI states instead as they
  are synchronized actions. apl-defaults introduce race conditions.
*/
{
    route : '#/profile',
    partial : 'partials/profile.html'
},
/*Messages*/
{
    route : '#/messages',
    partial : ['#/profile',
    {
      partial : 'partials/Profile/messages.html',
      target : '#profile-right-col'
    }]
},
/*people*/
{
    route : '#/people',
    partial : ['#/profile',
    {
      partial : 'partials/Profile/people.html',
      target : '#profile-right-col'
    }]
},
/*My Ads*/
{
    route : '#/my-ads',
    partial : ['#/profile',
    {
      partial : 'partials/My-Ads/wrapper.html',
      target : '#profile-right-col'
    },
             
    {
      partial : 'partials/My-Ads/my-ads.html',
      target : '#my-ads-content'
    }]
},
/*Show Ad*/
{
  route : '#/show-ad/AdForm:ad_id',
  partial : 'partials/New-Ad/preview.html'
},
/*Edit Ad*/
{
  route : '#/edit-ad/AdForm:ad_id/state/AdForm:ad_state',
  partial : ['#/new-ad']
},
/*New Ad*/
{
    route : '#/new-ad',
    partial : ['#/profile',
    { 
      partial : 'partials/New-Ad/wrapper.html', 
      target : '#profile-right-col'
    }]
},
{
    route : '#/new-ad/2',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/typeform',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri',
    partial : ['#/profile',
    { 
      partial : 'partials/New-Ad/wrapper.html', 
      target : '#profile-right-col',
      fallback : '#/new-ad'
    }]
    
},
{
    route : '#/new-ad/preview',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
}]);