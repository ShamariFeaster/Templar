structureJS.module('Map', function(require){

var _ = this;
var DOM = require('DOM');
var _repeatTable = Object.create(null);/*modelName : { attribName : node}*/
var _controlTable = Object.create(null);/*ctrlId : [ctrl1, ctrl2,......]*/
var _map = Object.create(null);/*no prototype chain, better iteration performance >= IE9*/
  /*Add system event types to listener pool*/
_map[_.SYSTEM_EVENT_TYPES.system] = Object.create(null);
_map[_.SYSTEM_EVENT_TYPES.system]['listeners'] = Object.create(null);

var TMP_Node = require('TMP_Node');

return {
  buildAttribAlias : function(attribName){
    return '_' + attribName;
  },
  getRepeatBaseNodes : function(modelName, attribName){
    var baseNodes = [];

    if((_.isDef(attribName) && _.isDef(modelName)) &&
        _.isDef(_repeatTable[modelName]) && 
        _.isDef(_repeatTable[modelName][attribName]))
      baseNodes = _repeatTable[modelName][attribName];
    
    return baseNodes;
  },
  /*This is designed for re-interps. We want to get dead base nodes out of the cache.
    This is not only for performance reasons. Interpolate.interpolateEmbeddedRepeats()
    uses the current index of the parent's repeat to pull the proper base node out
    the cache. If dead nodes remain, this indexing is thrown out of alignment.*/
  pruneBaseNodes : function(baseNodes){
    for(var i = 0; i < baseNodes.length; i++){
      /*visibility is a bad check*/
      if(_.isNull(baseNodes[i].node.parentNode) || !document.body.contains(baseNodes[i].node)){
        baseNodes.splice(i, 1);
        i--;
      }
    }
  },
  
  isRepeatedAttribute : function(modelName, attribName){
    return (this.getRepeatBaseNodes(modelName, attribName).length > 0);
  },
  
  addRepeatBaseNode : function(tmp_node){
    if(!_.isDef(_repeatTable[tmp_node.modelName])){
      _repeatTable[tmp_node.modelName] = Object.create(null);
    }
    
    if(!_.isDef(_repeatTable[tmp_node.modelName][tmp_node.attribName])){
      _repeatTable[tmp_node.modelName][tmp_node.attribName] = [];
    }
      _repeatTable[tmp_node.modelName][tmp_node.attribName].push(tmp_node);
  },

  
  exists : function(modelName){
    return (_.isDef(_map[modelName]));
  },
  
  contains : function(array, needle){
    if(!_.isArray(array))
      return false;
      
    var result = false;
    for(var i = 0; i < array.length; i++){
      if(array[i] === needle){
        result = true; 
        break;
      }
    }
    return result;
  },
  /*Checks currentScope against a comma-separated list of scopes*/
  isInScopeList : function(currentScope, compiledScopes, tryMatchTime){
    var scopeListParts = null,
        currScopeParts = (_.isDef(currentScope)) ? currentScope.split(' ') : [],
        compiledScopes = (_.isDef(compiledScopes)) ? compiledScopes.split(',') : [],
        tryMatchTime = (_.isDef(tryMatchTime)) ? tryMatchTime : false;
        inScope = false;
        
    if(compiledScopes.length > 0){
      /*incorrectly formatted scopes get set to [nuul,null]*/
      currScopeParts = (currScopeParts.length > 1) ? currScopeParts : [null, null];
      /*produce 2-d array with [name, timestamp] as elements*/
      scopeListParts = compiledScopes.map(function(el){ 
                        var scopeParts = el.split(' ');
                        return (scopeParts.length > 1) ? scopeParts : [null, null];
                      });
      /*if either comparisson operator is null*/
      for(var i = 0; i < scopeListParts.length; i++){
          if(_.isNullOrEmpty(currScopeParts[0]) || _.isNullOrEmpty(scopeListParts[i][0]))
            continue;
            
          if(currScopeParts[0] == scopeListParts[i][0]){
            inScope = (tryMatchTime == true) ? (true && (currScopeParts[1] == scopeListParts[i][1])) : true;
            break;
          }
        
      }
    }
    
    return inScope;
  },

  forEach : function(modelName, attribName, mapFunction){
    //__modelMap[modelName] = {modelObj : modelObj, nodes : Object.create(null), api : api, listeners : Object.create(null)};
    var target = null;
    var Map = this;
    var ctx = Object.create(null);
    ctx.modelName = '';
    ctx.modelAtrribName = '';
    ctx.hasAttributes = false;
    ctx.stop = false;
    ctx.target = null;
    ctx.targetCopy = null;
    ctx.key = '';
    ctx.length = 0;
    ctx.index = 0;
    ctx.modelAttribIndex = 0;
    ctx.modelAttribLength = 0;
    ctx.removeItem = function(i){
      ctx.target.splice(i, 1);
      /*
      var indexCnt = Object.create(null);
      
      for(var i = 0; i < ctx.target.length; i++ ){
        if(ctx.target[i].index > _.UNINDEXED)
          indexCnt[ctx.target[i].index] = true;
      }
      ctx.modelAttribLength = Object.keys(indexCnt).length;
      */
      ctx.index--;

    };

    /*model names*/
    if(_.isFunc(modelName)){
    
      mapFunction = modelName;
      target = _map;
      for(var key in target){
          mapFunction.call(null, {modelName : key}, key);
        
      }
    /*model attribute names*/
    }else if(!_.isFunc(modelName) && _.isFunc(attribName)){ 
    
      mapFunction = attribName;
      var modelAttribName = '';

      target = (_.isDef(_map[modelName]) && _.isDef(_map[modelName]['nodeTable'])) ? 
                  _map[modelName]['nodeTable'] : Object.create(null);
                  
      for(var key in target){
        ctx.modelName = modelName;
        ctx.modelAtrribName = key;
        mapFunction.call(null, ctx, key);
      }
    /*model attribute node tables (index table and interpolatation array)*/
    }else if(!_.isFunc(modelName) && !_.isFunc(attribName) && _.isFunc(mapFunction)){
      var tmp_node = null,
          indexCnt = {};
      if( _.isDef(_map[modelName]['nodeTable'][attribName]) ){
        ctx.target = _map[modelName]['nodeTable'][attribName]['nodes'];

        for(; ctx.index < ctx.target.length && ctx.stop == false; ctx.index++, indexCnt = {}){
          tmp_node = ctx.target[ctx.index];
          /*Single attrib could be used multiple times. For example, a select may be used twice in 
            an app. The cache would contain 2 nodes per index and modelAttribLength would be
            # of options * 2. We should only count nodes that share my scope, meaning */
          for(var i = 0; i < ctx.target.length; i++ ){
            if(ctx.target[i].index > _.UNINDEXED && tmp_node.scope == ctx.target[i].scope)
              indexCnt[ctx.target[i].index] = true;
          }
          
          ctx.modelAttribLength = Object.keys(indexCnt).length;
          ctx.modelName = modelName;
          ctx.modelAtrribName = attribName;
          ctx.modelAttribIndex = tmp_node.index;
          ctx.key = key;
          ctx.hasAttributes = (Object.keys(ctx.target[ctx.index].symbolMap).length > 0) ? true : false;
          mapFunction.call(null, ctx, tmp_node);
          
        }

      }
    }

  },
  pushNodes : function(DOMorTMPNode, modelName, attribName, index){
    var tmp_node = DOMorTMPNode;
    if(!(tmp_node instanceof TMP_Node))
      tmp_node = new TMP_Node(DOMorTMPNode, modelName, attribName, index);
    
    /*If user references unknown model in template we get this error*/
    if(!_.isDef(_map[tmp_node.modelName])){
      throw 'FATAL ERROR: Model "' + tmp_node.modelName + ' Is Undeclared.';
    }
       
    if( !_.isDef(_map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]) ){
      _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName] = { nodes : []};

    }

    _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]['nodes'].push(tmp_node);

  },
  annotateWithLimitProps : function(model, attribName, value){
    
    if(_.isArray(value) && !_.isDef(value.page)){
      Object.defineProperty(value, 'page', {
        set : function(val){
          model.gotoPage(val).of(attribName);
        },
        get : function(){ return model.currentPageOf(attribName);}
      });
      Object.defineProperty(value, 'totalPages', {
        set : function(val){},
        get : function(){return model.totalPagesOf(attribName);}
      });
      Object.defineProperty(value, 'limit', {
        set : function(val){
          model.limit(attribName).to(val);
        },
        get : function(){
          var val = (!_.isDef(model.limitTable[attribName])) ? 
                0 : model.limitTable[attribName].limit;
          return val;
          }
      });
    }
    
  },
  getPageSlice : function(Model, attributeName, target){
    var start = 0,
        end = target.length,
        limit = 0, 
        page = 0,
        results = target;
    if(_.isDef(Model.limitTable[attributeName]) && _.isArray(target)){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      Model.limitTable[attributeName].totalPages = Math.floor(results.length/limit);
      Model.limitTable[attributeName].totalPages += ((results.length%limit > 0) ? 1 : 0);
      end = (((limit * page))  <= target.length) ? 
               ((limit * page)) : target.length;
      start = ( ((page * limit) - limit) < end) ?
              (page * limit) - limit : 0;
      results = target.slice(start, end);
      this.annotateWithLimitProps(Model, attributeName, results);
    }    
    
            
    return results;
  },
  
  getAttribute : function(modelName, attribName, index, property){
    if(!_.isDef(_map[modelName])) 
      return null;
      
    var returnVal = null,
        Model = _map[modelName]['api'];
    
    
    if(_.isDef(_map[modelName]) && _.isDef(_map[modelName]['modelObj'][attribName])){
      returnVal = _map[modelName]['modelObj'][attribName];
    }
    
    /*We should always pull the filtered subset if a static filter has been applied*/
    if(_.isDef(_map[modelName]['filterResults'][attribName])){
      returnVal = _map[modelName]['filterResults'][attribName];
    }
    
    /*Get page, if limit has been defined*/    
    if(_.isDef(Model.limitTable[attribName]) && Model.limitTable[attribName].limit > 0){
      returnVal = this.getPageSlice(Model, attribName, returnVal);
    }
    
    /*special case due to fact that repeats are recompiled instead of interpolated. this means the
      values shown can only be what is returned by this fnction. We don't want to clobber the 
      attrib during filtering so instead we create a link to the filtered version. This is signaled
      by the existence of an entry in the Model's cachedResults with a key of the model attrib name.
      This link is broken when the filter fails by removing the entry from the link table.*/
    if(_.isDef(_map[modelName]['cachedResults'][attribName])){
      returnVal = _map[modelName]['cachedResults'][attribName];
    }
    

    
    if(_.isDef(index) && _.isDef(property) && _.isArray(returnVal) && _.isDef(returnVal[index][property])){
        
      returnVal = returnVal[index][property];
      
    }else 
    if(_.isDef(index) && _.isArray(returnVal[index]) && _.isDef(returnVal[index])){
      
      returnVal = returnVal[index];
      
    }
    
    return returnVal;
  },
  
  dereferenceAttribute : function(TMP_node){
    if(!_.isDef(_map[TMP_node.modelName])) 
      return null;
      
    var returnVal = null,
        attribute = null,
        prop = null,
        queue = TMP_node.indexQueue.slice(0),
        modelName = TMP_node.modelName,
        attribName = TMP_node.attribName;
    
    if(_.isDef(attribute = returnVal = this.getAttribute(modelName,attribName))){
      if(_.isArray(attribute) || _.isObj(attribute)){
        while((prop = queue.shift()) != null && _.isDef(attribute[prop])){
          returnVal = attribute = attribute[prop];
        }

      }else{
        returnVal = attribute;
      }
      
    }

    return returnVal;
  },
  
  setAttribute : function(modelName, attribName, value){
    var returnVal = null;
    if(_.isDef(_map[modelName]) && _.isDef(_map[modelName]['modelObj'][attribName])){
      _map[modelName]['modelObj'][attribName] = value;
    }
    return returnVal;
  },
  
  getListeners : function(modelName, attributeName){
    var listeners = [];
    if(_.isDef(_map[modelName]['listeners'][attributeName])){
      listeners = _map[modelName]['listeners'][attributeName];
    }
    
    return listeners;
  },
  getFuncHash : function(func){
    var string = func.toString(),
        hash = string.length + string.charAt(string.length/2);
    return hash;
  },
  setListener : function(modelName, attributeName, listener, isFilterListener){        
    if(_.isFunc(listener)){
      var hash = this.getFuncHash(listener);
      if(_.isDef(isFilterListener) && isFilterListener == true){
        hash = '_LIVE_FILTER_' + hash + Math.random();
        _.log('Adding duplicate with hash ' + hash + ' on ' + modelName + '.' + attributeName);
      }

      if(!_.isDef(_map[modelName]['listeners'][attributeName])){
        _map[modelName]['listeners'][attributeName] = Object.create(null);
      }
      
      _map[modelName]['listeners'][attributeName][hash] = listener;
    }        
  },
  
  removeAllListeners : function(modelName, attribName){
    delete _map[modelName]['listeners'][attribName];
  },
  
  removeListener : function(modelName, attribName, listener){
    var listeners = _map[modelName]['listeners'][attribName],
        needleHash = this.getFuncHash(listener),
        deleteFunc = false;
    for(var haystackHash in listeners){
      if(needleHash == haystackHash){
        delete listeners[haystackHash];
      }
    }
  },
  isDuplicateListener : function(modelName, attribName, listener){
    var listeners = this.getListeners(modelName, attribName);
    
    for(var hash in listeners){
      if(listener.toString() == listeners[hash].toString())
        return true;
    }
    
    return false;
    
  },
  
  removeFilterListeners : function(modelName, attribName){
    if(_.isDef(_map[modelName]['listeners'][attribName])){
      var listeners = _map[modelName]['listeners'][attribName];
      for(var hash in listeners){
        if(hash.indexOf('_LIVE_FILTER_') == 0){
          _.log('REMOVING Listener with hash: ' + hash);
          delete listeners[hash];
        }
      }
    }
  },
  
  getModel : function(modelName){
    var model = null;
    if(this.exists(modelName)){
      model = _map[modelName]['api'];
    }else{
      _.log('WARNING: Attempt To Get Model "' + modelName + '" Failed.');
    }
    return model;
  },
  
  initModel : function(model_obj){
    _map[model_obj.modelName] = {modelObj : model_obj.attributes, nodeTable : Object.create(null),
                      api : model_obj, listeners : Object.create(null), cachedResults : model_obj.cachedResults,
                      limitTable : model_obj.limitTable, filterResults : model_obj.filterResults};
                      
  },
  /*----REPEAT INTERPOLATION CLEANUP-----------------*/
  destroyRepeatTree : function(modelName, attribName){
    this.forEach(modelName, attribName, function(ctx, tmp_node){

      ctx.removeItem(ctx.index);

      /*only remove visible elements from DOM, don't remove base node from DOM*/
      if(!_.isNull(tmp_node.node.parentNode) && tmp_node.index > _.UNINDEXED){
        tmp_node.node.parentNode.removeChild(tmp_node.node);
        
      }
    });
  },
  
  pruneDeadEmbeds : function(){
    var Map = this;
        
    Map.forEach(function(ctx, modelName){
      Map.forEach(ctx.modelName, function(ctx, attribName){
        Map.forEach(ctx.modelName, ctx.modelAtrribName, function(ctx, tmp_node){
          var node = tmp_node.node;
          if((!_.isNullOrEmpty(tmp_node.repeatModelName) && !_.isNullOrEmpty(tmp_node.repeatAttribName)) 
            && !document.body.contains(node)){
            ctx.removeItem(ctx.index);
          }
        });
              
      });
    
    });
    
  },
  
  /*----SCOPE CHANGE CLEANUP-----------------*/
  pruneNodeTreeByScope : function( compiledScopes ){
    if(_.isNullOrEmpty(compiledScopes) )
      return;
    
    var attribNodes = null,
        nodeScopeParts = null,
        interpolateNodes = null,
        indexNodes = null,
        Map = this;
        
    Map.forEach(function(ctx, modelName){
      Map.forEach(ctx.modelName, function(ctx, attribName){
        /*remove listeners*/
          
        Map.forEach(ctx.modelName, ctx.modelAtrribName, function(ctx, tmp_node){
          var node = tmp_node.node;
          
          if(( nodeScopeParts = tmp_node.scope.split(' ')) !== null){
            if(Map.isInScopeList(tmp_node.scope, compiledScopes) && !Map.isInScopeList(tmp_node.scope, compiledScopes, true)){
              ctx.removeItem(ctx.index);
              //Map.removeListener(ctx.modelName, ctx.modelAtrribName);
              _.log('Pruning ' + node.tagName + ' for ' + ctx.modelName + '.' + ctx.modelAtrribName 
                  + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
            }
          }
        });
              
      });
    
    });
    
  },
  /*----DEBUGGING-----------------*/
  getInternalModel : function(modelName){
    results = null;
    if(this.exists(modelName))
      results = _map[modelName];
    return results;
  },
  getMap : function(){
    return _map;
  },
  
  getRepeat : function(){
    return _repeatTable;
  }
  
  
};



});