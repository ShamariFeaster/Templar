window.structureJS.module('State', function(){
'use strict';

return {
  preventUpdate : false,
  target : '',
  aplHideList : '',
  compilationThreadCount : 0,
  onloadFileQueue : [],
  hasDeclaredRoutes : false,
  compiledScopes : '',
  ignoreHashChange : false,
  ignoreKeyUp : false,
  dispatchListeners : true,
  blockBodyCompilation : false
};
});