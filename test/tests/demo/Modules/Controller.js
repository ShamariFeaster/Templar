structureJS.module('Controller', function(require){

var _ = require('Util'),
    _Templar = Templar,
    Helper = require('Helper');
    
function Controller(){
  if(!(this instanceof Controller))
    return new Controller;
  
  this.bindHandlers = function(){};
  
  this._init = function(banner, errorMsg, successMsg){
    Helper.init.call(Helper, banner, errorMsg, successMsg);
    this.bindHandlers.call(this);
  }
  this._userInit = this._init;
  
  Object.defineProperty(this, 'init', {
    set : function(val){
      if(_.isFunc(val)){
        this._userInit = function(){
          val.apply(null, arguments);
          this._init.apply(this, arguments)
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