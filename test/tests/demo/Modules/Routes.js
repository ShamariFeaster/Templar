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
/*---PROFILE---*/
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
/*Wall*/
{
    route : '#/wall',
    partial : ['#/profile',
    {
      partial : 'partials/Profile/wall.html',
      target : '#profile-right-col'
    }]
},
/*My Ads*/
{
    route : '#/my-ads',
    partial : ['#/profile',
    {
      partial : 'partials/Profile/my-ads.html',
      target : '#profile-right-col'
    }]
},
/*New Ad*/
{
    route : '#/new-ad',
    partial : ['#/profile',
    { 
      partial : 'partials/Profile/new-ad-part-1.html', 
      target : '#profile-right-col'
    }]
},
{
    route : '#/new-ad/2',
    partial : 'partials/Profile/new-ad-part-2.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/typeform',
    partial : 'partials/Profile/new-ad-part-3.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri',
    partial : ['#/profile',
    { 
      partial : 'partials/Profile/new-ad-pic-upload.html', 
      target : '#profile-right-col',
      fallback : '#/new-ad'
    }]
    
}]);