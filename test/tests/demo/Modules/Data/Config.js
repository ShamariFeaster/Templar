structureJS.module('Config', function(require){
  return {
    categoryFormId : 'type-specific-form-partial',
    formsDir : 'partials/New-Ad/TypeSpecificAdForms/',
    formsCtrlDir : 'Modules/Controllers/AdForms/',
    adPicDir : 'server/ad_pics/',
    ppPicDir : 'server/profile_pics/',
    serverRoot : 'server/',
    endpointRoot : 'http://localhost/Templar/test/tests/demo/server/REST/endpoints/',
    SERVER_DEBUG : false
  };
});