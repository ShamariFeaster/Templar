structureJS.module('Controller', function(require){

function Controller( mixin ){
  
  if(!(this instanceof Controller)){
    return new Controller( mixin );
  }

  this.bindHandlers = function(){};
  
  this._init = function(banner, errorMsg, successMsg){
    this.Helper.init.call(this.Helper, banner, errorMsg, successMsg);
    this.bindHandlers.call(this);
  }
  
  this._userInit = this._init;

  /*should be storing user init on Controller to prevent scope lookup*/
  Object.defineProperty(this, 'init', {
    set : function(val){
      if(this._.isFunc(val)){
        this._userInit = function(){
          this._init.apply(this, arguments);
          val.apply(this, arguments);
        };
      }
    },
    get : function(){
      return this._userInit;
    }
  });
  this._super = this;
  if(this._.isFunc(mixin)){
    mixin.call(this);
  }
}

/* Cache globals and static classes on proto */
Controller.prototype.Helper = require('Helper');
Controller.prototype._ = require('Util');
Controller.prototype.w = window;
Controller.prototype.rt = require('Route');

/* standarize partial input */
Controller.prototype.getPartialObj = function(partial){
  var _partial = '', target = '';
  
  if(this._.isString(partial)){
    _partial = partial;
  }else if(this._.isObj(partial) && this._.isString(partial.partial)){
    _partial = partial.partial;
  }
  
  if(this._.isObj(partial) && this._.isString(partial.target)){
    target = partial.target;
  }
  return {partial : _partial, target : target};
}

Controller.prototype.loadPartial = function(partial, callback){
  var callback = callback || function(){};
  var pObj = this.getPartialObj(partial);

  this.w.Templar.success(pObj.partial, callback);
  /* std pObj.target is '' if not present, openPartial defaults target to main content area */
  this.rt.openPartial(pObj.partial, pObj.target);
  
};
return Controller;

});