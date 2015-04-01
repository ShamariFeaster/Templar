structureJS.module('ModelAPI', function(require){

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');
var State = require('State');

/************************GENERAL************************************/
/*Non-clobbering updating of interface using new data. Note that */
/*public*/
Model.prototype.softset = function(attribName, value){
  this.cachedResults[attribName] = value;
  Interpolate.interpolate(this.modelName, attribName, value);
  delete this.cachedResults[attribName];
  if(_.isDef(this.limitTable[attribName])){
    this.limitTable[attribName].page = 1;
  }
};

Model.prototype.update = function(attribName){
  Interpolate.interpolate(this.modelName, attribName, Map.getAttribute(this.modelName, attribName));
};

/*public*/
Model.prototype.listen = function(attributeName, listener){
  if(!Map.isDuplicateListener(this.modelName, attributeName, listener))
    Map.setListener(this.modelName, attributeName, listener);
};

Model.prototype.unlisten = function(attributeName){
  Map.removeListener(this.modelName, attributeName);
};

Model.prototype.save = function(){
  var output = '';
  if(!_.isDef(this.attributes['__meta__']))
    this.attributes['__meta__'] = {};
  
  for(var attribName in this.attributes){
    var attrib = this.attributes[attribName];
    if(_.isArray(attrib)){
      for(var arrProp in attrib){
      
        if(attrib.hasOwnProperty(arrProp) && !/^-?[0-9]+$/.test(arrProp)){
           
           if(!_.isDef(this.attributes['__meta__'][attribName])){
            this.attributes['__meta__'][attribName] = {};
           }
           
           this.attributes['__meta__'][attribName][arrProp] = 
            (_.isString(attrib[arrProp])) ? 
              attrib[arrProp] :
              JSON.stringify(attrib[arrProp]);
        }
      }
      
    }
  }
  output = JSON.stringify(this.attributes);
  delete this.attributes['__meta__'];
  if(_.isDef(window.sessionStorage)){
    window.sessionStorage[this.modelName] = output;
  }
  return output;
};

Model.prototype.load = function(jsonString){
var thawed, thawFailed = false;
  
  if(_.isDef(window.sessionStorage) && !_.isDef(jsonString)){
    jsonString = window.sessionStorage[this.modelName];
    window.sessionStorage.removeItem(this.modelName);
  }
  try{
    thawed = JSON.parse(jsonString);
  }catch(e){
    thawFailed = true
  }
  
  if(thawFailed == true){
    _.log('ERROR: Frozen item was not proper JSON. Thaw failed.');
    return;
  }
  
  var meta,
    metaProp,
    thawedItem;
  
  for(var prop in thawed){
    if(prop != '__meta__')
      this[prop] = thawed[prop];
  }
  
  if(_.isDef(meta = thawed['__meta__'])){
    /*Reinstate meta*/
    for(var prop in meta){
      metaProp = meta[prop];
      for(var item in metaProp){
        if(_.isDef(this.attributes[prop])){
          try{
            thawedItem = JSON.parse(metaProp[item]);
          }catch(e){
            thawedItem = metaProp[item];
          }
          if(item == '_value_')
            item = 'current_selection';
          this.attributes[prop][item] = thawedItem;
        }
      }
      
    }
  }
  
};

});