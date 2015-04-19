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
    partial : ['partials/profile.html', 
    {
      partial : 'partials/Profile/ad-search.html',
      target : '#profile-right-col'
    }]
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
/*ad search */
{
    route : '#/ad-search',
    partial : ['#/profile']
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
/*Edit Ad
  Best practice : although you can set a Model's state from anywhere, best practice
  is to set an attribute using routing if the route makes use of that attribute. 
  Don't do inter-route communication directly on a model.
*/
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