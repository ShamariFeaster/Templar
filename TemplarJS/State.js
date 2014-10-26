structureJS.module('State', function(require){
return {
  preventUpdate : false,
  target : '',
  aplHideList : '',
  compilationThreadCount : 0,
  onloadFileQueue : [],
  hasDeclaredRoutes : false,
  compiledScopes : ''
};
});