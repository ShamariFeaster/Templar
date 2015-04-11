structureJS.module('Config', function(require){
  return {
    categoryFormId : 'type-specific-form-partial',
    formsDir : 'partials/New-Ad/TypeSpecificAdForms/',
    formsCtrlDir : 'Modules/Controllers/AdForms/',
    adPicDir : 'server/ad_pics/',
    serverRoot : 'server/',
    SERVER_DEBUG : true
  };
});