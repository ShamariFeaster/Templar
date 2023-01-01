structureJS.module('ClassModelFilter', function(require){

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');


/*******************FILTERING*************************************/
/*INTERNAL*/
Model.prototype.filterWarapper = function(/*req*/attribName, /*nullable*/property, /*nullable*/input, filterFunc
                                        , clearCachedResults, storeFilterResults, isInputFilter){
  /*make sure getAttribute() returns the full array to filter against, unless clearCachedResults is true
    this is used to differentiate between filters that watch live attributes and those that filter data statically.
    Live filter shouldn't used cached results on every filter; rather they should check the whole set with each update.
  */
  if(_.isDef(clearCachedResults) && clearCachedResults  == true){
    delete this.cachedResults[attribName];
  }
  
  /*if we fail input filter we should restore he attribute to original state*/
  if(_.isDef(isInputFilter) && isInputFilter == true){
    if(filterFunc.call(null, input) == false){
      if(_.isNullOrEmpty(input))
        Interpolate.interpolate(this.modelName, attribName,  Map.getAttribute(this.modelName, attribName));

      return false;
    }
    else{
      return true;
    }
  }
  
  var Model = this,
      results = [],
      target = Map.getAttribute(Model.modelName, attribName),
      filterResults = null,
      item = null;
  
  target = Map.getPageSlice(Model, attribName, target);
  
  if(_.isArray(target)){
  
    for(var i = 0; i < target.length; i++){
      item = target[i];
      if(!_.isNullOrEmpty(property) && _.isDef(item[property])){
        itemValue = item[property];
      }else{
        itemValue = item;
      }
      /*if this is a static filter pass filter funct the itemVal as first arg. Live filters
        need the input first. This is done because live 'and' functions signal to this wrapper
        that they are input filters by having a single param (input). Those funcs have no use for
        an item val.*/
      filterResults = (storeFilterResults == true) ? 
                        filterFunc.call(null, itemValue ) :
                        !_.isNullOrEmpty(input) && filterFunc.call(null, input, itemValue );
      if(filterResults == true){
        results.push(item);
      }
    }
    
    /*empty set returned by filtering, kill cachedResults  but also set results to original set.
      Chained 'and's in static filters have to pass results to each other via the cachedResults.
    */
    if(results.length < 1){
      delete Model.cachedResults[attribName];
      /*get full attrib before interpolation. of importance with repeats during recompilation*/
      if(clearCachedResults == true){
        results = Map.getAttribute(Model.modelName, attribName);
        Interpolate.interpolate(Model.modelName, attribName, results);
      }
    }else{
      /*cachedResults signals to getAttribute() to return these temp results during recompilation*/
      Model.cachedResults[attribName] = results;
      
      /*This subset acts as the v=original attrib from now on. This is to persist static filtering*/
      if(_.isDef(storeFilterResults) && storeFilterResults  == true)
        Model.filterResults[attribName] = results;
      Interpolate.interpolate(Model.modelName, attribName, results);
    }
    
  }
  return true;
};
/*public*/
Model.prototype.filter = function(attribName){
  var chain = Object.create(null),
      propName = '',
      itemValue = null,
      item = null,
      Model = this,
      clearCachedResults = true,
      storeFilterResults = void(0),
      defaultFilter = function(input, item){
        var notEmpty = (!_.isNullOrEmpty(item) && !_.isNullOrEmpty(input));
        return ( notEmpty && (item.toString().toLowerCase().indexOf(input.toLowerCase()) == 0));
      };
  
  chain.propName = '';
  chain.isStatic = false;
  chain.liveAndFuncs = [];
  
  chain.using = function(atrribNameOrFunction){
      if(_.isFunc(atrribNameOrFunction)){
        /*Static Filter (arity == 1)
          Function take a single arg which is list element, returns bool a < 5 for example*/
          clearCachedResults = false;
          storeFilterResults = true;
          chain.isStatic = true;

        Model.filterWarapper(attribName, chain.propName, null, atrribNameOrFunction,
                          clearCachedResults, storeFilterResults);
      }
      else{
        if(!_.isDef(Model.liveFilters[attribName])){
          Model.liveFilters[attribName] = [];
        } 

        Model.liveFilters[attribName].push(atrribNameOrFunction);
        
        Map.setListener(Model.modelName, atrribNameOrFunction, function(data){
          /*clear results when we have no chained 'and' functions*/
          clearCachedResults = (chain.liveAndFuncs.length < 1);

          var passedInputFilter = true,
              overrideDefaultLiveFilter = false;
          /*Filter with live 'and' functions. Default 'startsWith' filter is overridden on
            functions /w arity == 2*/
          for(var i = 0; i < chain.liveAndFuncs.length && passedInputFilter == true; i++){
            var isInputFilter = (chain.liveAndFuncs[i].length == 1);
            passedInputFilter = chain.liveAndFuncs[i].funct.call(null, data.text, chain.propName,
                                                        isInputFilter);
            overrideDefaultLiveFilter |= !isInputFilter; 
          }
          _.log('overrideDefaultLiveFilter: ' + overrideDefaultLiveFilter);
          /*if we passed input filter, we shoould move on to default filter.
          IMPORTANT!!! If input filter fails, interp never happens and listeners on the filtered 
          attribs never fire*/
          if(passedInputFilter == true && overrideDefaultLiveFilter == false){
            
            /*default filter for model attribute is a 'startsWith' string compare*/
            Model.filterWarapper(attribName, chain.propName, data.text, defaultFilter , 
                              clearCachedResults, storeFilterResults);
          }

        }, true);

      }
      
      return chain;  
    };
    
    chain.by = function(propName){
      chain.propName = propName;
      
      return chain;
    }
    
    chain.andBy = function(propName){
      chain.propName = propName;
      
      return chain;
    }
    
    /*'and' queries on live filters iterate the entire data set. */
    chain.and = function(comparitorFunc){
    
      if(_.isFunc(comparitorFunc)){
      
        /*Live comparitors should take input*/
        chain.liveAndFuncs.push({ funct : function(input, propName, isInputFilter){
          storeFilterResults = chain.isStatic;
          clearCachedResults = !chain.isStatic;
          return Model.filterWarapper(attribName, propName, input, comparitorFunc,
                                  clearCachedResults, storeFilterResults, isInputFilter);
        }, length : comparitorFunc.length});
        
        /*push input filters to the front*/
        chain.liveAndFuncs.sort(function(a,b){
          return (a.funct.length != 1);
        });
        
        clearCachedResults = false;
        storeFilterResults = (comparitorFunc.length == 1);//is static
        
        if( storeFilterResults == true){
          Model.filterWarapper(attribName, chain.propName, null, comparitorFunc,
                            clearCachedResults, storeFilterResults);
        }
        
      }
      return chain;
    }

  return chain;
};
/*public*/
Model.prototype.resetLiveFiltersOf = function(attribName){
  var watching = null;
  if(_.isDef(this.liveFilters[attribName])){
    watching = this.liveFilters[attribName];
    for(var i = 0; i < watching.length; i++){
      Map.removeFilterListeners(this.modelName, watching[i]);
    }
  }
}
/*public*/
Model.prototype.resetStaticFiltersOf = function(attribName){
  delete this.filterResults[attribName];
};


});