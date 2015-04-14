structureJS.module('Controller', function(require){

var _ = require('Util'),
    _Templar = window.Templar,
    Helper = require('Helper');
    
function Controller( extendo ){
  
  if(!(this instanceof Controller)){
    return new Controller( extendo );
  }
  
  if(_.isObj(extendo)){
    for(var prop in extendo){
      this[prop] = extendo[prop];
    }
  }
  
  this.bindHandlers = function(){};
  
  this._init = function(banner, errorMsg, successMsg){
    Helper.init.call(Helper, banner, errorMsg, successMsg);
    this.bindHandlers.call(this);
  }
  this._userInit = this._init;
  /*should be storing user init on Controller to prevent scope lookup*/
  Object.defineProperty(this, 'init', {
    set : function(val){
      if(_.isFunc(val)){
        this._userInit = function(){
          this._init.apply(this, arguments);
          val.apply(null, arguments);
        };
      }
    },
    get : function(){
      return this._userInit;
    }
  });
}


return Controller;

});