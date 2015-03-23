Templar.Route([
{
    route : '#/editProfile',
    partial : 'partials/edit-profile.html'
},
{
    route : '#/editProfile/ProfileForm:uploadStatus/',
    partial : 'partials/edit-profile.html'
},
{
    route : '#/profile',
    partial : 'partials/profile.html'
},
{
    route : '#/messages',
    partial : 'partials/Profile/messages.html',
    target : '#profile-right-col'
},
{
    route : '#/my-ads',
    partial : 'partials/Profile/my-ads.html',
    target : '#profile-right-col'
},
{
    route : '#/new-ad',
    partial : [
      '#/profile',
      { 
        partial : 'partials/Profile/new-ad-part-1.html', 
        target : '#profile-right-col'
      }]
},
{
    route : '#/new-ad-part-2',
    partial : 'partials/Profile/new-ad-part-2.html',
    target : '#profile-right-col',
    fallback : '#/new-ad'
},
{
    route : '#/wall',
    partial : 'partials/Profile/wall.html',
    target : '#profile-right-col'
},
{
    route : '#/login',
    partial : 'partials/login-screen.html'
}]);