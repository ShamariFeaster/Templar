structureJS.module('Map', function(require){

var _ = this;
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
  
  addRepeatBaseNode : function(tmp_node){
    if(!_.isDef(_repeatTable[tmp_node.modelName])){
      _repeatTable[tmp_node.modelName] = Object.create(null);
    }
    
    if(!_.isDef(_repeatTable[tmp_node.modelName][tmp_node.attribName])){
      _repeatTable[tmp_node.modelName][tmp_node.attribName] = [];
    }
      _repeatTable[tmp_node.modelName][tmp_node.attribName].push(tmp_node);
  },
  
  addControlNode : function(ControlNode){
    if(!_.isDef(_controlTable[ControlNode.id]))
      _controlTable[ControlNode.id] = [];
    
    _controlTable[ControlNode.id].push(ControlNode);
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

  Control : {
    forEach : function(mapFunction){
      var ControlNode = null;
      if(!_.isFunc(mapFunction))
        return;
        
      var ctrlIdArray = null,
          ctx = Object.create(null);
          ctx.index = 0; 
          ctx.id = ''; 
          ctx.length = 0; 
          ctx.stop = false; 
          ctx.target = [];
          ctx.removeItem = function(i){
            this.target.splice(i, 1);
            this.length = this.target.length;
          };
                
      for(var id in _controlTable){
        ctrlIdArray = ctx.target = _controlTable[id];
        ctx.length = ctrlIdArray.length;
        ctx.id = id;
        for(var i = 0; i < ctrlIdArray.length; i++){
          ctx.index = i;
          ControlNode = ctrlIdArray[i];
          mapFunction.call(null, ctx, ControlNode);
          if(ctx.stop == true ) break;
        }
      }
    }
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
      var indexCnt = Object.create(null);
      
      for(var i = 0; i < ctx.target.length; i++ ){
        if(ctx.target[i].index > _.UNINDEXED)
          indexCnt[ctx.target[i].index] = true;
      }
      ctx.modelAttribLength = Object.keys(indexCnt).length;
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
          indexCnt = Object.create(null);
      if( _.isDef(_map[modelName]['nodeTable'][attribName]) ){
        ctx.target = _map[modelName]['nodeTable'][attribName]['nodes'];
        
        for(var i = 0; i < ctx.target.length; i++ ){
          if(ctx.target[i].index > _.UNINDEXED)
            indexCnt[ctx.target[i].index] = true;
        }
        
        ctx.modelAttribLength = Object.keys(indexCnt).length;
        
        for(; ctx.index < ctx.target.length && ctx.stop == false; ctx.index++){
          tmp_node = ctx.target[ctx.index];
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
    if( !_.isDef(_map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]) ){
      _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName] = { nodes : []};

    }

    _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]['nodes'].push(tmp_node);

  },
  
  getPageSlice : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = target;
    if(_.isDef(Model.limitTable[attributeName]) && _.isArray(target)){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = (((limit * page))  <= target.length) ? 
               ((limit * page)) : target.length;
      start = ( ((page * limit) - limit) < length) ?
              (page * limit) - limit : 0;
      results = target.slice(start, length);
    }    
    
            
    return results;
  },
  
  getAttribute : function(modelName, attribName, index, property){
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
  
  setListener : function(modelName, attributeName, listener, isFilterListener){        
    if(_.isFunc(listener)){
      var string = listener.toString(),
          id = string.length + string.charAt(string.length/2);
      if(_.isDef(isFilterListener) && isFilterListener == true){
        id = '_LIVE_FILTER_' + id + Math.random();
        _.log('Adding duplicate with id ' + id + ' on ' + modelName + '.' + attributeName);
      }

      if(!_.isDef(_map[modelName]['listeners'][attributeName])){
        _map[modelName]['listeners'][attributeName] = Object.create(null);
      }
      
      _map[modelName]['listeners'][attributeName][id] = listener;
    }        
  },
  
  removeListener : function(modelName, attribName){
    delete _map[modelName]['listeners'][attribName];
  },
  
  isDuplicateListener : function(modelName, attribName, listener){
    var listeners = this.getListeners(modelName, attribName);
    
    for(var id in listeners){
      if(listener.toString() == listeners[id].toString())
        return true;
    }
    
    return false;
    
  },
  
  removeFilterListeners : function(modelName, attribName){
    if(_.isDef(_map[modelName]['listeners'][attribName])){
      var listeners = _map[modelName]['listeners'][attribName];
      for(var id in listeners){
        if(id.indexOf('_LIVE_FILTER_') == 0){
          _.log('REMOVING Listener with id: ' + id);
          delete listeners[id];
        }
      }
    }
  },
  
  getModel : function(modelName){
    var model = null;
    if(this.exists(modelName)){
      model = _map[modelName]['api'];
    }
    return model;
  },
  
  initModel : function(model_obj){
    _map[model_obj.modelName] = {modelObj : model_obj.attributes, nodeTable : Object.create(null),
                      api : model_obj, listeners : Object.create(null), cachedResults : model_obj.cachedResults,
                      limitTable : model_obj.limitTable, filterResults : model_obj.filterResults};
                      
  },
  pruneControlNodesByIndex : function(tmp_node, modelName, attribName, index){
    var Map = this,
        scopeParts = tmp_node.scope.split(' '),
        nodeScopeParts = null,
        deleteNodes = true;
    /*Remove embedded controls*/  
    
    Map.Control.forEach(function(ctrlCtx, ctrlNode){

      nodeScopeParts = ctrlNode.scope.split(' ');

      if( (nodeScopeParts[0] == scopeParts[0] && nodeScopeParts[1] == scopeParts[1])
          && ctrlNode.index == index 
          && ctrlNode.modelName == modelName 
          && ctrlNode.attribName == attribName
      ){
        _.log('Pruning Controll Node ' + ctrlNode.node.tagName + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
        ctrlCtx.removeItem(ctrlCtx.index);
      }
      
      
    });
    
  },
  
  pruneControlNodesByScope : function(modelName, attribName, index, compiledScopes){
    var Map = this,
        nodeScopeParts = null,
        deleteNodes = true;
    /*Remove embedded controls*/  
    
    Map.Control.forEach(function(ctrlCtx, ctrlNode){

      nodeScopeParts = ctrlNode.scope.split(' ');

      if( (Map.isInScopeList(ctrlNode.scope, compiledScopes) && !Map.isInScopeList(ctrlNode.scope, compiledScopes, true))
          && ctrlNode.index == index 
          /*non-repeat controls have '' for model/atrrib names*/
          && (ctrlNode.modelName == modelName || _.isNullOrEmpty(ctrlNode.modelName))
          && (ctrlNode.attribName == attribName || _.isNullOrEmpty(ctrlNode.attribName))
      ){
        _.log('Pruning Controll Node ' + ctrlNode.node.tagName + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
        ctrlCtx.removeItem(ctrlCtx.index);
      }
      
      
    });
  },
  
  pruneEmbeddedNodes : function(tmp_baseNode, repeatModelName, repeatAttribName, index){
    var Map = this,
        embeddedAttribs = Object.keys(tmp_baseNode.embeddedModelAttribs),
        splitAttrib = null;

    for(var i = 0; i < embeddedAttribs.length; i++){
      if(!_.isNullOrEmpty(embeddedAttribs[i])){
        splitAttrib = embeddedAttribs[i].split('.');/*0 = modelName, 1 = attribName*/
        
        Map.forEach(splitAttrib[0], splitAttrib[1], function(ctx, tmp_node){
        
          if(tmp_node.repeatModelName == repeatModelName 
             && tmp_node.repeatAttribName == repeatAttribName 
             && tmp_node.repeatIndex == index){
              ctx.removeItem(ctx.index);
              _.log('Pruning Embedded :' + tmp_node.node.tagName);

          }
          
        });
      }
    }
    
  },
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
          var node = tmp_node.node,
              repeatIndex = tmp_node.index;
          if(( nodeScopeParts = tmp_node.scope.split(' ')) !== null){
            if(Map.isInScopeList(tmp_node.scope, compiledScopes) && !Map.isInScopeList(tmp_node.scope, compiledScopes, true)){
              ctx.removeItem(ctx.index);
              Map.pruneControlNodesByScope(ctx.modelName, ctx.modelAtrribName, repeatIndex, compiledScopes );
              //Map.removeListener(ctx.modelName, ctx.modelAtrribName);
              _.log('Pruning ' + node.tagName + ' for ' + ctx.modelName + '.' + ctx.modelAtrribName 
                  + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
            }
          }
        });
              
      });
    
    });
    
  },
  getInternalModel : function(modelName){
    results = null;
    if(this.exists(modelName))
      results = _map[modelName];
    return results;
  },
  getMap : function(){
    return _map;
  },
  
  getControls : function(){
    return _controlTable;
  },
  
  getRepeat : function(){
    return _repeatTable;
  },
  /*returns an array of ControlNode(s). These have valid elements as their 'node' property*/
  getBaseControls : function(controlName){
    return (_.isDef(_controlTable[controlName])) ? _controlTable[controlName] : null;;
  }
};



});