structureJS.module('ModelFilter', function(require){

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');


Model.prototype.sort = function(attribName, pageNum){
  var chain = Object.create(null),
      Model = this,
      oldPageNum = 0,
      oldLimit = 0,
      A_FIRST = -1,
      B_FIRST = 1,
      NO_CHANGE = 0;
      
  chain.target = Map.getAttribute(Model.modelName, attribName);
  /*substituting target for the page slice. Also need to set the 'page' meta-data
    to the requested page for getPageSlice() and other slice-concerned functions
    to work. The previous values are reinstated later*/
  if(_.isDef(pageNum) && _.isDef(Model.limitTable[attribName]) && pageNum > 0){
    oldPageNum = Model.limitTable[attribName].page;
    Model.limitTable[attribName].page = pageNum;
    chain.target = Map.getPageSlice(Model, attribName, chain.target);
  }
  
  chain.propName = '';
  chain.prevProps = [];
  
  /*in a page sort chain.target is a slice of the full target*/
  chain.insertSortedSlice = function(targetSlice, Model, attribName, pageNum){
    /*Short circuit this so we don't set limitTable.page to undefined*/
    if(!_.isDef(pageNum) || !_.isDef(Model.limitTable[attribName]))
      return;
      
    Model.limitTable[attribName].page = pageNum;
    /*we have to trick getAttribute() to give us the full slice*/
    oldLimit = Model.limitTable[attribName].limit;
    Model.limitTable[attribName].limit = 0;
    /*we have to get full target on each call because last call has changed it*/
    var fullTarget = Map.getAttribute(Model.modelName, attribName);
    Model.limitTable[attribName].limit = oldLimit;
    var points = Interpolate.getPageSliceData(Model, attribName, fullTarget),
        fullTargetCopy = null;
        
    /*point.start of -1 indicates undefined limitTable*/
    if(points.start > -1 && !_.isNull(targetSlice)){

      fullTargetCopy = fullTarget.slice(0);
      /*t = target, ts = target slice*/
      for(var ts = 0, t = points.start; ts < targetSlice.length && t < points.length; ts++, t++){
        fullTargetCopy[t] = targetSlice[ts];
      }
      Map.setAttribute(Model.modelName, attribName, fullTargetCopy.slice(0));
      Model.limitTable[attribName].page = oldPageNum;
    }
  };
  
  chain.sorter = function(a,b){
    var orig_a = a,
        orig_b = b,
        a = (!_.isNull(chain.propName)) ? a[chain.propName] : a,
        b = (!_.isNull(chain.propName)) ? b[chain.propName] : b,
        intA = parseInt(a),
        intB = parseInt(b),
        pastPropsAligned = true,
        sortAction = NO_CHANGE;
        
    if(!_.isDef(a) || !_.isDef(b)){
      return NO_CHANGE;
    }
    /*if all of the prev sorted props of the operands are not aligned, no-op.
      ie, previously sorted fields must have the same value to sort this field*/
    for(var i = 0; i < chain.prevProps.length; i++){
      pastPropsAligned &= (orig_a[chain.prevProps[i]] == orig_b[chain.prevProps[i]]);
    }
    
    a = (isNaN(intA)) ? a : intA;
    b = (isNaN(intB)) ? b : intB;
    sortAction = (b < a) ? B_FIRST : A_FIRST;
    sortAction = (pastPropsAligned == true) ? sortAction : NO_CHANGE;
    return sortAction
  };
    
  chain.orderBy = function(propName){
    chain.propName = propName;
    chain.target.sort(chain.sorter);
    chain.insertSortedSlice(chain.target, Model, attribName, pageNum);
    chain.prevProps.push(propName);
    return chain;
  };
  
  chain.thenBy = function(propName){
    chain.propName = propName;
    chain.target.sort(chain.sorter);
    chain.insertSortedSlice(chain.target, Model, attribName, pageNum);
    chain.prevProps.push(propName);
    return chain;
  }
  
  return chain;
  
}

Model.prototype.sortCurrentPageOf = function(attribName){
  var chain = Object.create(null),
      Model = this,
      limitTable = Model.limitTable[attribName];
      
  if(_.isDef(limitTable)){
    return Model.sort(attribName, limitTable.currentPage);
  }
}

});