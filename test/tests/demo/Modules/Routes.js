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
  route : '#/main-layout',
  partial : 'partials/layout.html'
},

{
    route : '#/my-profile',
    partial : ['#/main-layout', 
    {
      partial : 'partials/Profile/profile.html',
      target : '#layout-center-col'
    }]
},
/*---- MESSAGES -----*/
{
    route : '#/messages',
    partial : ['#/main-layout',
    {
      partial : 'partials/Profile/messages.html',
      target : '#layout-center-col'
    }]
},
/*------AD SEARCH------ */
{
    route : '#/ad-search',
    partial : ['#/main-layout', 
    {
      partial : 'partials/Ad-Search/header.html',
      target : '#layout-center-col'
    },
    {
      partial : 'partials/Ad-Search/wrapper.html',
      target : '#returned-ads'
    },        
    {
      partial : 'partials/Ad-Search/ad-list.html',
      target : '#ad-list-content'
    }]
},
/*ad search show ad*/
{
    route : '#/ad-search/show-ad/AdSearch:ad_id/creator/AdMetadata:creatorUid',
    partial : ['#/my-ads/show-ad/MyAds:ad_id',
    {
      partial : 'partials/MetaSidebar/wrapper.html',
      target : '#layout-right-col'
    }]
},
/*ad search make comment*/
{
    route : '#/ad-search/add-comment/AdSearch:ad_id',
    partial : ['#/ad-search/show-ad/AdSearch:ad_id/creator/AdMetadata:creatorUid',
    {
      partial : 'partials/Comment-Forms/basic.html',
      target : '#meta-sidebar-content'
    }]
},
/*ad search make comment*/
{
    route : '#/ad-search/respond/AdSearch:ad_id',
    partial : ['#/ad-search/add-comment/AdSearch:ad_id']
},
/*------ MY ADS ------*/
{
    route : '#/my-ads',
    partial : ['#/main-layout',
    {
      partial : 'partials/My-Ads/wrapper.html',
      target : '#layout-center-col'
    },
             
    {
      partial : 'partials/My-Ads/my-ads.html',
      target : '#my-ads-content'
    }]
},
/*----- SHOW AD -----*/
{
  route : '#/my-ads/show-ad/MyAds:ad_id',
  partial : ['#/main-layout',
    {
      partial : 'partials/Show-Ad/wrapper.html',
      target : '#layout-center-col'
    },
    {
      partial : 'partials/New-Ad/preview.html',
      target : '#ad-container'
    }
  ]
 
},
/*---- EDIT AD -----
  Best practice : although you can set a Model's state from anywhere, best practice
  is to set an attribute using routing if the route makes use of that attribute. 
  Don't do inter-route communication directly on a model.
*/
{
  route : '#/edit-ad/AdForm:ad_id/state/AdForm:ad_state',
  partial : ['#/new-ad']
},
/*---- NEW AD -----*/
{
    route : '#/new-ad',
    partial : ['#/main-layout',
    { 
      partial : 'partials/New-Ad/wrapper.html', 
      target : '#layout-center-col'
    }]
},
{
    route : '#/new-ad/2',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#layout-center-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/typeform',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#layout-center-col',
    fallback : '#/new-ad'
},
{
    route : '#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri',
    partial : ['#/main-layout',
    { 
      partial : 'partials/New-Ad/wrapper.html', 
      target : '#layout-center-col',
      fallback : '#/new-ad'
    }]
    
},
{
    route : '#/new-ad/preview',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#layout-center-col',
    fallback : '#/new-ad'
}]);