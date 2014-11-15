structureJS.module('ModelFilter', function(require){

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');

Model.prototype.limit = function(attribName){
  var chain = Object.create(null),
      Model = this,
      modelAttrib = 0,
      totalPages = 0;
  chain.to = function(limit){
    if(limit > 0){
      delete Model.limitTable[attribName];
      modelAttrib = Map.getAttribute(Model.modelName, attribName);
      
      if(_.isArray(modelAttrib)){
        totalPages = Math.floor(modelAttrib.length/limit);
        totalPages += ((modelAttrib.length%limit > 0) ? 1 : 0);
        Model.limitTable[attribName] = {limit : limit, page : 1, totalPages : totalPages, currentPage : 1};
        Model.update(attribName);
      }
      
    }
  };
  return chain;
};
/*public*/
Model.prototype.gotoPage = function(pageNum){
  var chain = Object.create(null),
      Model = this,
      limitTable = null;
  chain.of = function(attribName){
    limitTable = Model.limitTable[attribName];
    if(_.isDef(limitTable) && pageNum > 0 && pageNum <= limitTable.totalPages){
      limitTable.page = pageNum;
      Interpolate.interpolate(Model.modelName, attribName, Map.getAttribute(Model.modelName, attribName));
    }
  };
  return chain;
};

Model.prototype.gotoNextPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_.isDef(limitTable) && (limitTable.currentPage + 1 <= limitTable.totalPages )){
    Model.gotoPage(++limitTable.currentPage).of(attribName);
  }
};

Model.prototype.gotoPreviousPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_.isDef(limitTable) && (limitTable.currentPage - 1 > 0 )){
    Model.gotoPage(--limitTable.currentPage).of(attribName);
  }
};

Model.prototype.currentPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_.isDef(limitTable)){
    return limitTable.currentPage;
  }
};

Model.prototype.totalPagesOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_.isDef(limitTable)){
    return limitTable.totalPages;
  }
};

});