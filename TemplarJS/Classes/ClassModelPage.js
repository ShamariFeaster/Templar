window.structureJS.module('ModelFilter', function(require){

'use strict';

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');

Model.prototype.limit = function(attribName){

  var chain = {};
  var Model = this;
  var modelAttrib = 0;
  var totalPages = 0;
  
  chain.to = function(limit){

    delete Model.limitTable[attribName];
    modelAttrib = Map.getAttribute(Model.modelName, attribName);
    
    if(_.isArray(modelAttrib) && limit >= 0){
      totalPages = Math.floor(modelAttrib.length/limit);
      totalPages += ((modelAttrib.length%limit > 0) ? 1 : 0);
      Model.limitTable[attribName] = {limit : limit, page : 1, totalPages : totalPages, currentPage : 1};
      Model.update(attribName);
    }

  };
  return chain;
};


Model.prototype.gotoPage = function(pageNum){
  var chain = {};
  var Model = this;
  var limitTable = null;
  
  chain.of = function(attribName){
    limitTable = Model.limitTable[attribName];
    if(_.isDef(limitTable) && pageNum > 0 && pageNum <= limitTable.totalPages){
      limitTable.page = limitTable.currentPage = pageNum;
      Interpolate.interpolate(Model.modelName, attribName, Map.getAttribute(Model.modelName, attribName));
    }
  };
  
  return chain;
};

Model.prototype.gotoNextPageOf = function(attribName){
  var Model = this;
  var limitTable = Model.limitTable[attribName];
  
  if(_.isDef(limitTable) && (limitTable.currentPage + 1 <= limitTable.totalPages )){
    Model.gotoPage(++limitTable.currentPage).of(attribName);
  }
};

Model.prototype.gotoPreviousPageOf = function(attribName){
  var Model = this;
  var limitTable = Model.limitTable[attribName];
  
  if(_.isDef(limitTable) && (limitTable.currentPage - 1 > 0 )){
    Model.gotoPage(--limitTable.currentPage).of(attribName);
  }
};

Model.prototype.currentPageOf = function(attribName){
  var Model = this;
  var limitTable = Model.limitTable[attribName];
  var result = 0;
  
  if(_.isDef(limitTable)){
    result = limitTable.currentPage;
  }
  
  return result;
};

Model.prototype.totalPagesOf = function(attribName){
  var Model = this;
  var limitTable = Model.limitTable[attribName];
  var result = 0;
  
  if(_.isDef(limitTable)){
    result = limitTable.totalPages;
  }
  
  return result;
};

});