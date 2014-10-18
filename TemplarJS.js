(function(){
/*Constants and Utilities*/
var _MODEL_ATTRIB_KEY = 'aplAttrib',
  _MODEL_ATTRIB_REPEAT_KEY = 'aplRepeat',
  _TARGET_ATTRIB_KEY = 'aplTarget',
  _CTRL_KEY = 'aplControl',
  _CTRL_ATTRIB_STRING = 'data-apl-control',
  _CLASS_SEPARATOR = /,|\s/,
  _NT_REGEX = /\w\:\w/,
  _TEXT_NODE = 3,
  _ELEMENT_NODE = 1,
  _UNINDEXED = -1,
  _NON_TERMINAL = 0,
  _TERMINAL = 1,
  _SYSTEM_EVENT_TYPES = { system : 'system', interpolation_done : 'interp-done'};
  _classesSetToHide = '',
  _isDef = function(a){return (typeof a !== 'undefined');},
  _isString = function(a){ return (!_isDef(a) || typeof a === 'string');},
  _isFunc = function(a){ return (!_isDef(a) || typeof a === 'function');},
  _isNull = function(a){ return (!_isDef(a) || a == null);}
  _isNullOrEmpty = function(a){ return (!_isDef(a) || (a === null || a === ''));},
  _isArray = function(a){return (!_isNull(a) && typeof a !== 'string' && _isDef(a.length))},
  _log = function(a){console.log(a);};

var TMP_Node = function(node, modelName, attribName, index){
  if(!(this instanceof TMP_Node))
    return new TMP_Node(node, id, modelName, attribName, index);
    
  this.node = node;
  this.modelName = modelName;
  this.attribName = attribName;
  this.index = (_isDef(index))? index : -1;
  this.prop = '';
  this.symbolMap = Object.create(null);
  this.hasNonTerminals = false;
  this.embeddedControls = [];
  this.embeddedModelAttribs = Object.create(null);
  this.scope = '';
  this.hasAttributes = false;
  this.repeatModelName = '';
  this.repeatAttribName = '';
  this.repeatIndex = _UNINDEXED;
};

var ControlNode = function(node, id, modelName, attribName, index){
  if(!(this instanceof ControlNode))
    return new ControlNode(node, id, modelName, attribName, index);
  
  var thisChild = null;
  this.node = _isDef(node) ? node : null;
  this.id = _isDef(id) ? id : '';
  this.modelName = _isDef(modelName) ? modelName : '';
  this.attribName = _isDef(attribName) ? attribName : '';
  this.index = (_isDef(index))? index : -1;
  this.scope = '';
  this.childIds = Object.create(null);
  this.controlBaseNodes = [];

  /*child nodes keyed on their ids*/
  if(!_isNull(this.node)){
    for(var x = 0; x < this.node.children.length; x++){
      if(!_isNullOrEmpty(this.node.children[x].id)){
        /*children are wrapped so they can use ControlNode functions. Children also should put
        themselves on the controlBaseNodes property. This is so indexedWrapper() will work as expected*/
        thisChild = new ControlNode(this.node.children[x]);
        thisChild.controlBaseNodes.push(thisChild)
        this.childIds[this.node.children[x].id] = thisChild;
      }
    }
  }
  
};

var State = {
  preventUpdate : false,
  target : '',
  aplHideList : '',
  compilationThreadCount : 0,
  onloadFileQueue : []
};

var DOM = {
  modifyClasses : function(node, add, remove){
    var nodeClassList = '',
        removeAsArray = remove.split(_CLASS_SEPARATOR);
    
    if(!_isNull(node)){
      /*getAttribute may return '' or null so we check below*/
      nodeClassList = node.getAttribute('class');
      nodeClassList = (_isNull(nodeClassList)) ? '' : nodeClassList.trim();
      for(var i = 0; i < removeAsArray.length; i++ ){
        nodeClassList = nodeClassList.replace(removeAsArray[i], '', 'g');
      }
      node.setAttribute('class', nodeClassList + ' ' + add);
    }
  },
  hideByIdList : function(commaSeparatedIdList){
    var nodeToHide = null,
        idListAsArray = null;
        
    if(commaSeparatedIdList != null && commaSeparatedIdList != ''){
      idListAsArray = commaSeparatedIdList.split(_CLASS_SEPARATOR);
      for(var i = 0; i < idListAsArray.length; i++){
        nodeToHide = document.getElementById(idListAsArray[i]);
        this.modifyClasses(nodeToHide,'apl-hide','apl-show,apl-hide');
        
      }
    }
  },
  appendTo : function(child, parent){  
    if(!_isDef(parent) || !_isDef(child) || _isNull(parent.parentNode))
      return;
    parent.parentNode.insertBefore(child, child.nextSibling);
  },
  
  cloneAttributes : function(fromNode, toNode){
    if(fromNode.hasAttributes()){
      attributes = fromNode.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        if(attributes[i].name == 'data-apl-repeat' || attributes[i].name == 'style')
          continue;
        
        toNode.setAttribute(attributes[i].name, attributes[i].value);
      }

    }
  },
  
  isVisible : function(DOM_node){
    if(_isNull(DOM_node))
      return false;
    
    return (DOM_node.offsetWidth > 0 && DOM_node.offsetHeight > 0);
  }
};  

var Map = (function(){
  var _map = Object.create(null);/*no prototype chain, better iteration performance >= IE9*/
  /*Add system event types to listener pool*/
  _map[_SYSTEM_EVENT_TYPES.system] = Object.create(null);
  _map[_SYSTEM_EVENT_TYPES.system]['listeners'] = Object.create(null);
  var _repeatTable = Object.create(null);/*modelName : { attribName : node}*/
  var _controlTable = Object.create(null);/*ctrlId : [ctrl1, ctrl2,......]*/
  return {
  buildAttribAlias : function(attribName){
    return '_' + attribName;
  },
  getRepeatBaseNodes : function(modelName, attribName){
    var baseNodes = [];
    if(!_isDef(attribName) || !_isDef(modelName))
      return baseNodes;
      
    if(_isDef(_repeatTable[modelName]) && _isDef(_repeatTable[modelName][attribName]))
      return _repeatTable[modelName][attribName];
  
  },
  
  addRepeatBaseNode : function(tmp_node){
    if(!_isDef(_repeatTable[tmp_node.modelName])){
      _repeatTable[tmp_node.modelName] = Object.create(null);
    }
    
    if(!_isDef(_repeatTable[tmp_node.modelName][tmp_node.attribName])){
      _repeatTable[tmp_node.modelName][tmp_node.attribName] = [];
    }
      _repeatTable[tmp_node.modelName][tmp_node.attribName].push(tmp_node);
  },
  
  addControlNode : function(ControlNode){
    if(!_isDef(_controlTable[ControlNode.id]))
      _controlTable[ControlNode.id] = [];
    
    _controlTable[ControlNode.id].push(ControlNode);
  },
  
  exists : function(modelName){
    return (_isDef(_map[modelName]));
  },
  
  contains : function(array, needle){
    if(!_isArray(array))
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
  
  Control : {
    forEach : function(mapFunction){
      var ControlNode = null;
      if(!_isFunc(mapFunction))
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
        if(ctx.target[i].index > _UNINDEXED)
          indexCnt[ctx.target[i].index] = true;
      }
      ctx.modelAttribLength = Object.keys(indexCnt).length;
      ctx.index--;

    };

    /*model names*/
    if(_isFunc(modelName)){
    
      mapFunction = modelName;
      target = _map;
      for(var key in target){
          mapFunction.call(null, {modelName : key}, key);
        
      }
    /*model attribute names*/
    }else if(!_isFunc(modelName) && _isFunc(attribName)){ 
    
      mapFunction = attribName;
      var modelAttribName = '';

      target = (_isDef(_map[modelName]) && _isDef(_map[modelName]['nodeTable'])) ? 
                  _map[modelName]['nodeTable'] : Object.create(null);
                  
      for(var key in target){
        ctx.modelName = modelName;
        ctx.modelAtrribName = key;
        mapFunction.call(null, ctx, key);
      }
    /*model attribute node tables (index table and interpolatation array)*/
    }else if(!_isFunc(modelName) && !_isFunc(attribName) && _isFunc(mapFunction)){
      var tmp_node = null,
          indexCnt = Object.create(null);
      if( _isDef(_map[modelName]['nodeTable'][attribName]) ){
        ctx.target = _map[modelName]['nodeTable'][attribName]['nodes'];
        
        for(var i = 0; i < ctx.target.length; i++ ){
          if(ctx.target[i].index > _UNINDEXED)
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
    if( !_isDef(_map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]) ){
      _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName] = { nodes : []};

    }

    _map[tmp_node.modelName]['nodeTable'][tmp_node.attribName]['nodes'].push(tmp_node);

  },
  
  getAttribute : function(modelName, attribName, index, property){
    var returnVal = null,
        Model = _map[modelName]['api'];
    if(_isDef(_map[modelName]) && _isDef(_map[modelName]['modelObj'][attribName])){
    
      if(_isDef(index) 
          && _isDef(property) 
          && _isArray(_map[modelName]['modelObj'][attribName]) 
          && _isDef(_map[modelName]['modelObj'][attribName][index][property])){
          
        returnVal = _map[modelName]['modelObj'][attribName][index][property];
        
      }else 
      if(_isDef(index) 
        && _isArray(_map[modelName]['modelObj'][attribName][index])
        && _isDef(_map[modelName]['modelObj'][attribName][index])){
        
        returnVal = _map[modelName]['modelObj'][attribName][index];
        
      }else{
      
        returnVal = _map[modelName]['modelObj'][attribName];
        
      }
      
    }
    
    /*We should always pull the filtered subset if a static filter has been applied*/
    if(_isDef(_map[modelName]['filterResults'][attribName])){
      returnVal = _map[modelName]['filterResults'][attribName];
    }
    
    /*Get page, if limit has been defined*/    
    if(_isDef(Model.limitTable[attribName]) && Model.limitTable[attribName].limit > 0){
      returnVal = Interpolate.getPageSlice(Model, attribName, returnVal);
    }
    
    /*special case due to fact that repeats are recompiled instead of interpolated. this means the
      values shown can only be what is returned by this fnction. We don't want to clobber the 
      attrib during filtering so instead we create a link to the filtered version. This is signaled
      by the existence of an entry in the Model's cachedResults with a key of the model attrib name.
      This link is broken when the filter fails by removing the entry from the link table.*/
    if(_isDef(_map[modelName]['cachedResults'][attribName])){
      returnVal = _map[modelName]['cachedResults'][attribName];
    }

    
    return returnVal;
  },
  
  setAttribute : function(modelName, attribName, value){
    var returnVal = null;
    if(_isDef(_map[modelName]) && _isDef(_map[modelName]['modelObj'][attribName])){
      _map[modelName]['modelObj'][attribName] = value;
    }
    return returnVal;
  },
  
  getListeners : function(modelName, attributeName){
    var listeners = [];
    if(_isDef(_map[modelName]['listeners'][attributeName])){
      listeners = _map[modelName]['listeners'][attributeName];
    }
    
    return listeners;
  },
  
  setListener : function(modelName, attributeName, listener, isFilterListener, isLateBoundListener){        
    if(_isFunc(listener)){
      var string = listener.toString(),
          id = string.length + string.charAt(string.length/2);
      if(_isDef(isFilterListener) && isFilterListener == true){
        id = '_LIVE_FILTER_' + id + Math.random();
        _log('Adding duplicate with id ' + id);
      }
      
      if(_isDef(isLateBoundListener) && isLateBoundListener == true){
        id = '_LATE_BOUND_' + id + Math.random();
        _log('Adding duplicate with id ' + id);
      }
      if(!_isDef(_map[modelName]['listeners'][attributeName])){
        _map[modelName]['listeners'][attributeName] = Object.create(null);
      }
      
      _map[modelName]['listeners'][attributeName][id] = listener;
    }        
  },
  
  removeListener : function(modelName, attribName){
    delete _map[modelName]['listeners'][attribName];
  },
  
  removeFilterListeners : function(modelName, attribName){
    if(_isDef(_map[modelName]['listeners'][attribName])){
      var listeners = _map[modelName]['listeners'][attribName];
      for(var id in listeners){
        if(id.indexOf('_LIVE_FILTER_') == 0){
          _log('REMOVING Listener with id: ' + id);
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
        _log('Pruning Controll Node ' + ctrlNode.node.tagName + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
        ctrlCtx.removeItem(ctrlCtx.index);
      }
      
      
    });
    
  },
  
  pruneControlNodesByScope : function(modelName, attribName, index, scope){
    var Map = this,
        scopeParts = scope.split(' '),
        nodeScopeParts = null,
        deleteNodes = true;
    /*Remove embedded controls*/  
    
    Map.Control.forEach(function(ctrlCtx, ctrlNode){

      nodeScopeParts = ctrlNode.scope.split(' ');

      if( (nodeScopeParts[0] == scopeParts[0] && nodeScopeParts[1] != scopeParts[1])
          && ctrlNode.index == index 
          /*non-repeat controls have '' for model/atrrib names*/
          && (ctrlNode.modelName == modelName || _isNullOrEmpty(ctrlNode.modelName))
          && (ctrlNode.attribName == attribName || _isNullOrEmpty(ctrlNode.attribName))
      ){
        _log('Pruning Controll Node ' + ctrlNode.node.tagName + ' scope: ' + nodeScopeParts[0] + ' ' + nodeScopeParts[1]);
        ctrlCtx.removeItem(ctrlCtx.index);
      }
      
      
    });
  },
  
  pruneEmbeddedNodes : function(tmp_baseNode, repeatModelName, repeatAttribName, index){
    var Map = this,
        embeddedAttribs = Object.keys(tmp_baseNode.embeddedModelAttribs),
        splitAttrib = null;

    for(var i = 0; i < embeddedAttribs.length; i++){
      if(!_isNullOrEmpty(embeddedAttribs[i])){
        splitAttrib = embeddedAttribs[i].split('.');/*0 = modelName, 1 = attribName*/
        
        Map.forEach(splitAttrib[0], splitAttrib[1], function(ctx, tmp_node){
        
          if(tmp_node.repeatModelName == repeatModelName 
             && tmp_node.repeatAttribName == repeatAttribName 
             && tmp_node.repeatIndex == index){
              ctx.removeItem(ctx.index);
              _log('Pruning Embedded :' + tmp_node.node.tagName);

          }
          
        });
      }
    }

    
  },
  pruneNodeTreeByScope : function( scope ){
    if(_isNullOrEmpty(scope) )
      return;
    
    var scopeParts = scope.split(' '),
        attribNodes = null,
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
              if((nodeScopeParts[0] == scopeParts[0] && nodeScopeParts[1] != scopeParts[1])){
                ctx.removeItem(ctx.index);
                Map.pruneControlNodesByScope(ctx.modelName, ctx.modelAtrribName, repeatIndex, scope );
                Map.removeListener(ctx.modelName, ctx.modelAtrribName);
                _log('Pruning ' + node.tagName + ' for ' + ctx.modelName + '.' + ctx.modelAtrribName 
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
    return (_isDef(_controlTable[controlName])) ? _controlTable[controlName] : null;;
  }
};
})();


var Process = {
  CONTROL_REGEX : new RegExp(_CTRL_ATTRIB_STRING + '=' + '"(\\w+)"', 'g'),
  parseModelAttribName : function(qualifiedAttribName){
    var modelNameParts = ['',''];
    if( _isDef(qualifiedAttribName) && ((modelNameParts = qualifiedAttribName.split('.')).length > 1)  ){
        ;//noop
    }
    return modelNameParts;
  },
  
  buildNonTerminal : function(modelName, modelAtrribName, propertyName, index){
    var propertyName = (_isNullOrEmpty(propertyName)) ? '' : '.' + propertyName;
    return '{{' + modelName + '.' + modelAtrribName + '[' + index + ']' + propertyName + '}}';
  },
  buildControlNonTerminal : function(modelName, modelAtrribName, ctrlName, index){
    index = (_isDef(index)) ? '.' + index : '';
    return '|' + modelName + '.' +  modelAtrribName + index;
  },
  buildRepeatNonTerminal : function(modelName, modelAtrribName, parentModel, parentAttrib, index){
    var propertyName = (_isNullOrEmpty(propertyName)) ? '' : propertyName;
    return '{{' + modelName + '.' + modelAtrribName + '[' + index + '].zTMPzDOT' + parentModel +'DOT' + parentAttrib + '}}';
  },
  preProcessNodeAttributes : function(node, scope){
    var attributes = null,
        match = null,
        regex = /\{\{(\w+)\.(\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\}/g,
        modelNameParts = null,
        tmp_node = null;
    
    /*Options don't need to be in the node tree due to having NTs in 'value' attribute*/
    if(node.hasAttributes() && node.tagName != 'OPTION'){
      attributes = node.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        /*disallow style and class interpolation*/
        if(attributes[i].name == 'style' || attributes[i].name == 'class'){
          continue;
        }

        while( (match = regex.exec(attributes[i].value)) != null ){
          tmp_node = new TMP_Node(node, match[1], match[2]);         
          tmp_node.symbolMap[attributes[i].name] = attributes[i].value;
          tmp_node.scope = scope;
          hasAttribNonTerminal = true;
          Map.pushNodes(tmp_node);
          /*This is necessary for repeats as their child nodes aren't added to Interpolation array
            Rather they are recompiled using repeated elements as the base. It makes sense since
            we do interpolation during preprocessing with repeats that we do the same with attributes
            in repeats*/
          Interpolate.updateNodeAttributes(tmp_node, tmp_node.modelName, tmp_node.attribName);
          /*annotate node with symbolMap and push it onto modelMap */
        }
        
      }

    }
  },
  preProcessControl : function(tmp_node){
    /*Annotate control names for compiler*/
    /*Indexed nodes get array pointing to embedded controls. This repeat DOM_Node's model, attrib
      index are used to identify the control and delete it when this DOM_Node is removed*/
    var intraCompilation = tmp_node.node.innerHTML,
        ctrlRegexResults = null,
        nonTerminal = '';
    while( ((ctrlRegexResults = new RegExp(_CTRL_ATTRIB_STRING + '=' + '"(\\w+)"', 'g').exec(tmp_node.node.innerHTML.trim())) != null )
          && !_isNullOrEmpty(tmp_node.modelName) && !_isNullOrEmpty(tmp_node.attribName)){

      tmp_node.embeddedControls.push(ctrlRegexResults[1]);
      nonTerminal = _CTRL_ATTRIB_STRING + '=' + '"' + ctrlRegexResults[1] 
              + this.buildControlNonTerminal(tmp_node.modelName, tmp_node.attribName, ctrlRegexResults[1], tmp_node.index) + '"';
        
        tmp_node.node.innerHTML = intraCompilation =  
          intraCompilation.replace(ctrlRegexResults[0], nonTerminal);
    }

  },
  
  preProcessRepeatNode : function(TMP_baseNode, index){
    var newId = null,
        repeatedProperties = null,
        embeddedInterpolations = null,
        uncompiledTemplate = '',
        uncompiledTemplate = ''
        intraCompilation = '',
        idvRepeatedProperty = null,
        nonTerminal = '',
        newDomNode = document.createElement(TMP_baseNode.node.tagName.toLowerCase()),
        TMP_repeatedNode = new TMP_Node(newDomNode, TMP_baseNode.modelName, TMP_baseNode.attribName, index),
        ctrlRegexResults = null,
        NONTERMINAL_REGEX = /(\{\{((\w+)\.(\w+))\}\})/g,
        ntFound = false,/*nonTerminalFound*/
        Process = this;
    DOM.cloneAttributes(TMP_baseNode.node, TMP_repeatedNode.node);
    TMP_repeatedNode.node.innerHTML = TMP_baseNode.node.innerHTML;
    /*auto enumeration of existing id attribute*/
    newId = TMP_baseNode.node.getAttribute('id');
    newId = ( newId == null) ? '' : TMP_repeatedNode.node.setAttribute('id', newId + '-' + index); 
    
    /*Process embedded NTs belonging to other models*/
    intraCompilation = TMP_repeatedNode.node.innerHTML;
    if( (embeddedInterpolations = NONTERMINAL_REGEX.exec(TMP_repeatedNode.node.innerHTML)) != null){
      TMP_baseNode.embeddedModelAttribs[embeddedInterpolations[3] + '.' + embeddedInterpolations[4]] = true;
      nonTerminal = this.buildRepeatNonTerminal(embeddedInterpolations[3], embeddedInterpolations[4], TMP_baseNode.modelName, TMP_baseNode.attribName , index);
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(embeddedInterpolations[0], nonTerminal );
    }
    
    /*repeat template is original TMP_baseNode with repeat directive on it. The non terminals here
      do not have index or property info. intraCompilation is progressively compiled 
      using text replacement. the comiled non-terminals now have prop and index info.
      
      For the next iteration through the repeat we reset intraCompilation to the un-compiled
      version we stored in uncompiledTemplate
      */
    if( (repeatedProperties = TMP_repeatedNode.node.innerHTML.match(/\{\{(\$*\w+)*\}\}/g)) != null){
      TMP_repeatedNode.hasNonTerminals = true;
      
      uncompiledTemplate = intraCompilation = TMP_repeatedNode.node.innerHTML;
      /*Cycle through them*/
      for(var z = 0; z < repeatedProperties.length; z++){
        
        if( (idvRepeatedProperty = /\{\{(\$*\w+)*\}\}/.exec(repeatedProperties[z]) ) ){
          
          if(idvRepeatedProperty[0] == '{{}}'){
            nonTerminal = this.buildNonTerminal(TMP_baseNode.modelName, TMP_baseNode.attribName, null, index);
            TMP_repeatedNode.node.innerHTML = intraCompilation = 
                    intraCompilation.replace(idvRepeatedProperty[0], nonTerminal );
           } 
          
          if(idvRepeatedProperty[0] == '{{$index}}'){
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], index);
          }
          
          if(idvRepeatedProperty[0] != '{{}}' && idvRepeatedProperty[0] != '{{$index}}'){
            nonTerminal = this.buildNonTerminal(TMP_baseNode.modelName, TMP_baseNode.attribName, idvRepeatedProperty[1], index);
            TMP_repeatedNode.node.innerHTML = intraCompilation =
                    intraCompilation.replace(idvRepeatedProperty[0], nonTerminal );
          }
          
        }

      }
      intraCompilation = uncompiledTemplate;
    }
    
    /*if no NTs found, repeatNode innerHTML must be empty to be clobbered over by model attrib value*/
    TMP_repeatedNode.hasNonTerminals = (TMP_repeatedNode.hasNonTerminals == false) ? 
                                        !_isNullOrEmpty(TMP_repeatedNode.node.innerHTML) :
                                        TMP_repeatedNode.hasNonTerminals;

    this.preProcessControl(TMP_repeatedNode);
    
    return TMP_repeatedNode;
  },
  
  preProcessNode : function(DOM_Node, modelName, attribName, scope){
    if(!_isDef(DOM_Node) || DOM_Node === null )
      return;
    var type = (_isDef(DOM_Node.dataset[_MODEL_ATTRIB_REPEAT_KEY])) 
                  ? 'REPEAT' :
                    DOM_Node.tagName;
    var attributeVal = null,
        regex = /(\{\{(\w+\.\w+)\}\})/g,
        indexRegex = /\{\{(\$*\w+)*\}\}/g,
        matches = null,
        modelNameParts = null,
        intermediateValue = '',
        uninterpolatedString = '',
        baseRepeatNode = null,
        TMP_RepeatBase = null,
        TMP_select = null,
        TMP_option = null,
        TMP_input = null,
        TMP_unknown = null,
        compileMe = true;
    
    switch(type){
    
      case 'SELECT':

        if( (matches = regex.exec(DOM_Node.innerHTML)) === null) 
          break;
          
        DOM_Node.innerHTML = '';
        modelNameParts = Process.parseModelAttribName(matches[2]);
        attributeVal = Map.getAttribute(modelNameParts[0],modelNameParts[1]);
        DOM_Node.model = modelNameParts[0];
        DOM_Node.name = modelNameParts[1];
        TMP_select = new TMP_Node(DOM_Node, modelNameParts[0], modelNameParts[1]);
        TMP_select.scope = scope;
        //push select onto 'interpolate' array
        Map.pushNodes(TMP_select);
        if(DOM_Node.children.length < 1){
          
          for(var i = 0; i < attributeVal.length; i++){
            TMP_option = new TMP_Node(document.createElement("option"),modelNameParts[0], modelNameParts[1], i) ;
            TMP_option.scope = scope;
            TMP_option.node.text = Process.buildNonTerminal(modelNameParts[0], modelNameParts[1], 'text', i);
            TMP_option.node.value = Process.buildNonTerminal(modelNameParts[0], modelNameParts[1], 'value', i);
            DOM_Node.appendChild(TMP_option.node);
            DOM_Node.selectedIndex = 
              (_isDef(attributeVal[i].selected) && attributeVal[i].selected == true) ? 
                i : DOM_Node.selectedIndex;
            Map.pushNodes(TMP_option);
          }
          
        }
        DOM_Node.addEventListener('change', function(e){
          Interpolate.dispatchListeners(
            Map.getListeners(this.model, this.name)
            , {type : 'select'
            , value : e.target.options[e.target.selectedIndex].value
            , text : e.target.options[e.target.selectedIndex].text
            , index : e.target.selectedIndex
              }
          );                  
        });
        break;
      case 'INPUT':

        if( (matches = regex.exec(DOM_Node.getAttribute('value'))) !== null){
          modelNameParts = Process.parseModelAttribName(matches[2]);
          DOM_Node.model = modelNameParts[0];
          DOM_Node.name = modelNameParts[1];
          DOM_Node.addEventListener('input', function(e){
            Map.setAttribute(this.model, this.name, e.target.value);
            Interpolate.interpolate(this.model, this.name, e.target.value );
          });
        }
        /*tmp_node is pushed during preProcessNodeAttributes()*/
        
        /*we don't push DOM_Node here because we can only bind to input using the value attribute
          which is a guarantee that DOM_Node will be pushed during preProcessNodeAttributes() */
        break;
      case 'REPEAT':
        attributeVal = Map.getAttribute(modelName, attribName);
        DOM_Node.model = modelName;
        DOM_Node.name = attribName;
        /*push source repeat DOM_Node onto 'interpolate' array*/
        TMP_RepeatBase = new TMP_Node(DOM_Node, modelName, attribName);
        TMP_RepeatBase.scope = scope;
        Map.addRepeatBaseNode(TMP_RepeatBase); 
        Map.pushNodes(TMP_RepeatBase); 
        TMP_RepeatBase.node.setAttribute('style','display:none;'); 

        /*notice lack of preProcessControl(). This is so we don't add control declared in repeatBase.
          we do call it during preProcessRepeatNode() on each of the repeated nodes*/
        compileMe = false;
        break;

      default: 
        TMP_unknown = new TMP_Node(DOM_Node, modelName, attribName);
        /*add controls on all non-repeat elements with control directive*/
        this.preProcessControl(TMP_unknown);
        break;
    }
    
    this.preProcessNodeAttributes(DOM_Node, scope);
    return compileMe;
  }
  
};

var Interpolate = {

  dispatchListeners : function(listeners, data){

    if(_isDef(listeners)){
      for(var id in listeners){
        if(_isFunc(listeners[id])){
          listeners[id].call(null, data);
        }
      }
    }
    
    if(!_isNull(data) && _isDef(data.caller) && data.caller == _SYSTEM_EVENT_TYPES.system){
      this.dispatchListeners.call(null, Map.getListeners(data.caller, data.type), null);
    }
    
  },
  
  updateNodeAttributes : function(tmp_node, modelName, attributeName){
    var updateObject = Object.create(null);
    var node = tmp_node.node;
    if(node.hasAttributes()){
      var regex = /(\{\{(\w+\.\w+)\}\})/g, 
      //result array -> [1] = {{a.b}}, [2] = a.b, 4 = index, 5 = prop
          ntRegex = /(\{\{(\w+\.\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\})/g,
          match = null,
          text = '',
          intermediateValue = '',
          uninterpolatedString = '',
          elemAttribName = '',
          currAttribVal = '',
          elemAttributes = node.attributes;
      
      for(var i = 0; i < elemAttributes.length; i++){
        elemAttribName = elemAttributes[i].name;

        uninterpolatedString = (_isDef(tmp_node.symbolMap[elemAttribName])) ? 
                                  tmp_node.symbolMap[elemAttribName] :
                                  '';
        /*short circuit: is this model attribute's non-terminal in the node attributes string?
          during compilation, any node with a non-terminal is annotated w/ a symbol map*/
        if(_isDef( uninterpolatedString ) && ntRegex.test(uninterpolatedString)){
          /*get each non-terminal then, using text replacement, we update the node attribute
            value*/
          ntRegex.lastIndex = 0;
          while(  (match = ntRegex.exec(uninterpolatedString)) != null){
            modelNameParts = Process.parseModelAttribName(match[2]);
            currAttribVal = Map.getAttribute(modelNameParts[0], modelNameParts[1], match[4], match[5]);
            intermediateValue = uninterpolatedString.replace(match[1], currAttribVal );
            uninterpolatedString = intermediateValue;
          }
          
          node.setAttribute(elemAttribName, intermediateValue);
          updateObject[elemAttribName] = intermediateValue;
        }
      }
    }

    return updateObject;
  },
  interpolateSpan : function(tmp_node, attributeVal){
    var node = tmp_node.node;
    if(_isNullOrEmpty(tmp_node.prop) && tmp_node.index == _UNINDEXED){
      node.innerText =  attributeVal;
    }else if(!_isNullOrEmpty(tmp_node.prop) && tmp_node.index >= 0){
      if(_isDef(attributeVal[tmp_node.index]) && tmp_node.index < attributeVal.length)
        node.innerText = attributeVal[tmp_node.index][tmp_node.prop];
    }else if(tmp_node.index >= 0){
      if(_isDef(attributeVal[tmp_node.index]) && tmp_node.index < attributeVal.length)
        node.innerText = attributeVal[tmp_node.index];
    }
  },
  /*Returns the whole attribute if no limit is defined for this attribute*/
  getPageSlice : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = target;
    if(_isDef(Model.limitTable[attributeName])){
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
  getPageSliceData : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = Object.create(null);
        results.start = -1;
        results.length = 0;
        
    if(_isDef(Model.limitTable[attributeName])){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = (((limit * page))  <= target.length) ? 
               ((limit * page)) : target.length;
      start = ( ((page * limit) - limit) < length) ?
              (page * limit) - limit : 0;
      results.start = start;
      results.length = length;
    }
    return results;
    
  },
  interpolate : function(modelName, attributeName, attributeVal){  
    if(!Map.exists(modelName))
      return;
      
    _log('Interpolating ' + modelName + '.' + attributeName);
    var option = null;
        listeners = Map.getListeners(modelName, attributeName),
        Interpolate = this,
        attribCurrState = Map.getAttribute(modelName, attributeName),
        updateObject = Object.create(null),
        numNodesToAdd = 0,
        numNodesToRemove = 0,
        newNodeStartIndex = 0,
        TMP_repeatBaseNode = null,
        updateObj = Object.create(null);
    
    Map.forEach(modelName, attributeName, function(ctx, tmp_node){
      var node = tmp_node.node;
      if(ctx.hasAttributes == true)
        updateObject = Interpolate.updateNodeAttributes(tmp_node, modelName, attributeName);
        
        
      switch(node.tagName){
        
        case 'SELECT':
          /*Make sure it's an array*/
          if(_isArray(attributeVal)){
          
            /*New model data, longer than existing data, add extra nodes*/
            if(attributeVal.length > ctx.modelAttribLength){
              /*amount of nodes needed*/
              var newNodeCnt = attributeVal.length - ctx.modelAttribLength,
                  /*where to start the new indexes in the 'indexes' table*/
                  newNodeIndex = attributeVal.length - newNodeCnt;
              
              for(var q = 0; q < newNodeCnt; q++, newNodeIndex++, ctx.modelAttribLength++){
                var tmp_option = new TMP_Node(document.createElement("option"),modelName, attributeName, newNodeIndex);
                tmp_option.node.text = attributeVal[newNodeIndex].text;
                tmp_option.node.value = attributeVal[newNodeIndex].value;
                node.appendChild(tmp_option.node);
                tmp_option.scope = tmp_node.scope;
                Map.pushNodes(tmp_option);
              }
            }
            
          }
          break;
        case 'OPTION':
          if(_isArray(attributeVal)){
            if(attributeVal.length <= ctx.modelAttribLength && ctx.modelAttribIndex < attributeVal.length){
                node.text = attributeVal[ctx.modelAttribIndex].text;
                node.value = attributeVal[ctx.modelAttribIndex].value;
                node.parentNode.selectedIndex = 
                  (_isDef(attributeVal[ctx.modelAttribIndex].selected) && attributeVal[ctx.modelAttribIndex].selected == true) ? 
                    ctx.modelAttribIndex : node.selectedIndex;
              
            }
            updateObj.value = node.parentNode.options[node.parentNode.selectedIndex].value;
            updateObj.text = node.parentNode.options[node.parentNode.selectedIndex].text;
            updateObj.type = 'select';
            updateObj.index = node.parentNode.selectedIndex;
            /*New model data, shorter than existing data, kill extra nodes*/
            if(ctx.modelAttribIndex >= attributeVal.length){
              ctx.removeItem(ctx.index); /*from indexes[key] = []*/
              /*this is most likely unecessary*/
              //Map.pruneControlNodesByIndex(tmp_node, modelName, attributeName, ctx.modelAttribIndex);
              node.parentNode.removeChild(node);
            }
            
            
          }
          break;
        
        case 'SPAN':

          Interpolate.interpolateSpan(tmp_node, attributeVal);
          updateObj.text = node.innerText;
          updateObj.type = node.tagName.toLowerCase();
          break;
        case 'INPUT':
          updateObj.text = node.value;
          updateObj.type = node.tagName.toLowerCase();
          break;
        default:
          var TMP_newRepeatNode = null,
              TMP_repeatedNode = null,
              outerCtx = ctx,
              baseNodes = null,
              repeatStart = 0,
              repeatEnd = 0;
         
         
          /*Kill existing repeat tree*/
          Map.forEach(modelName, attributeName, function(ctx, tmp_node){
            /*un-track all nodes*/
            Map.pruneControlNodesByIndex(tmp_node, modelName, attributeName, tmp_node.index);
            ctx.removeItem(ctx.index);
            /*only remove visible elements from DOM, don't remove base node from DOM*/
            if(!_isNull(tmp_node.node.parentNode) && tmp_node.index > _UNINDEXED)
              tmp_node.node.parentNode.removeChild(tmp_node.node);
          });
         
          baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
          for(var z = 0; z < baseNodes.length; z++){
            TMP_repeatBaseNode = baseNodes[z];
            /*If base node has no parent then it is not in the current DOM*/
            if(DOM.isVisible(TMP_repeatBaseNode.node.parentNode)){
              /*rebuild new one*/
              for(var i = 0; i < attributeVal.length; i++){
                Map.pruneEmbeddedNodes(TMP_repeatBaseNode, modelName, attributeName, i);
                TMP_repeatedNode = Process.preProcessRepeatNode(TMP_repeatBaseNode, i);
                TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
                Map.pushNodes(TMP_repeatedNode);
                if(TMP_repeatedNode.hasNonTerminals == false)
                  TMP_repeatedNode.node.innerHTML = attributeVal[i];
                DOM.appendTo(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
                Compile.compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope);
              }
            }
            
          }
            
          /*Stop outter loop. We build the updated repeat nodes in one pass*/
          outerCtx.stop = true;
          

          break;
        }
      
    });

    Interpolate.dispatchListeners(listeners, updateObj);
    
  }
  
};

var Compile = {
  
  compile : function(root, scope){
  
    if(_isNull(root) || _isNull(root.childNodes))
      return scope;

    var defaultPartialHref = root.getAttribute('data-apl-default');
    if(!_isNullOrEmpty(defaultPartialHref)){
      root.setAttribute('data-apl-default', '');
      State.compilationThreadCount++;
      State.onloadFileQueue.push(defaultPartialHref);
      Bootstrap.asynGetPartial(defaultPartialHref,Bootstrap.loadPartialIntoTemplate, null, root );
      _log('Spawning Thread <' + defaultPartialHref + '> w/ target <' + root.id + '> w/ scope <' + scope + '>');
      //return scope;
    }
    
    var nodes = root.childNodes,
        partMap = [],
        Compile = this,
        splitNode = null, span = null, parentNode = null, ctrlRegexResult = null,
        DOM_Node = null, match = null, modelNameParts = [null, null], 
        repeatAnnotationParts = null, controlNode = null,
        tmp_node = null,
        
        prevLength = 0, index = -1,
        
        text = '', parentTagName = '', ctrlName = '',
        modelName = '', attribName = '', qualifiedAttribName = '',
        propName = '',
        
        compileMe = false,
        //2 = a.b, 3 = [0], 4 = 0, 5 = propertyName  
        NONTERMINAL_REGEX = /(\{\{(\w+\.\w+)(\[(\d+)\])*(?:\.)*(\w+)*?\}\})/g;
        

    for(var i = 0; i < nodes.length; i++){
        DOM_Node = nodes[i];
        parentNode = DOM_Node.parentNode;
        /*option innerText should not be compiled*/
        if(DOM_Node.nodeType == _TEXT_NODE && (!_isNull(parentNode) && parentNode.tagName !== 'OPTION') ){
          text = DOM_Node.wholeText;
          /**/
          while(  (match = NONTERMINAL_REGEX.exec(text)) != null){
            modelNameParts = Process.parseModelAttribName(match[2]);
            
            partMap.push({ start : match.index, end : NONTERMINAL_REGEX.lastIndex, 
                          modelName : modelNameParts[0], attribName : modelNameParts[1],
                          fullToken : match[1], index : match[4] , propertyName : match[5]});

          }
          
          /*splitNode is right split, DOM_Node is left of split (ie original DOM_Node) */
          
          
          for(var x = 0; x < partMap.length; x++){
            parentTagName = parentNode.tagName;
            modelName = partMap[x]['modelName'];
            attribName = partMap[x]['attribName'];
            
            var span = document.createElement('span');
            /*interpolateIndex and interpolateProperty are passed with DOM_Node to 
              Interpolate.interpolate where it is used to properly dereference the model attrib*/
            propName = partMap[x]['propertyName'];
            index = (_isDef(partMap[x]['index'])) ? parseInt(partMap[x]['index']) : -1;
            tmp_node = new TMP_Node(span, modelName, attribName, index);
            tmp_node.prop = propName;
            /*Look for pattern created during preProcessRepeatNode() to indicate this node is an
              embedded interpolation node inside a repeat; however the model and/or attrib behind
              the node differ from that of the repeat*/
            if(!_isNullOrEmpty(propName) && propName.indexOf('zTMPzDOT') != _UNINDEXED){
              repeatAnnotationParts = propName.split('DOT');
              tmp_node.repeatModelName = repeatAnnotationParts[1];
              tmp_node.repeatAttribName = repeatAnnotationParts[2]; 
              tmp_node.repeatIndex = index;
              tmp_node.index = _UNINDEXED;
              tmp_node.prop = '';
            }
            
            tmp_node.scope = scope;
            
            splitNode = DOM_Node.splitText(partMap[x]['start'] - prevLength);
            prevLength += DOM_Node.nodeValue.length;
            /*{{Auth.items[0].text}}*/
            if(splitNode.nodeValue.trim() == partMap[x]['fullToken']){
              tmp_node.node.innerText = splitNode.nodeValue;
              Interpolate.interpolateSpan(tmp_node, Map.getAttribute(modelName, attribName));
              parentNode.replaceChild(tmp_node.node, splitNode);
              Map.pushNodes(tmp_node);             
              //log('1Parent Tag Name: ' + parentTagName + ' ' + partMap[x]['fullToken']);
            }
            if(DOM_Node.nodeValue.trim() == partMap[x]['fullToken']){
              tmp_node.node.innerText = DOM_Node.nodeValue;
              Interpolate.interpolateSpan(tmp_node, Map.getAttribute(modelName, attribName));
              parentNode.replaceChild(tmp_node.node, DOM_Node);
              Map.pushNodes(tmp_node); 
              //log('2Parent Tag Name: ' + parentTagName + ' ' + partMap[x]['fullToken']);
            }
            DOM_Node = nodes[++i];
            
            if(DOM_Node.nodeType != _TEXT_NODE)
                break;
            
            splitNode = DOM_Node.splitText(partMap[x]['end']  - prevLength);
            prevLength += DOM_Node.nodeValue.length;
            
            if(splitNode.nodeValue.trim() == partMap[x]['fullToken']){
              tmp_node.node.innerText = splitNode.nodeValue;
              Interpolate.interpolateSpan(tmp_node, Map.getAttribute(modelName, attribName));
              parentNode.replaceChild(tmp_node.node, splitNode);
              Map.pushNodes( tmp_node); 
              //log('3Parent Tag Name: ' + parentTagName + ' ' + partMap[x]['fullToken']);
            }
            if(DOM_Node.nodeValue.trim() == partMap[x]['fullToken']){
              tmp_node.node.innerText = DOM_Node.nodeValue;
              Interpolate.interpolateSpan(tmp_node, Map.getAttribute(modelName, attribName));
              parentNode.replaceChild(tmp_node.node, DOM_Node);
              Map.pushNodes( tmp_node ); 
              //log('4Parent Tag Name: ' + parentTagName + ' ' + partMap[x]['fullToken']);
            }
            DOM_Node = nodes[++i];

            if(DOM_Node.nodeType != _TEXT_NODE)
                break;
              
          }
          partMap.length = 0;
          prevLength = 0;
        }else if(DOM_Node.nodeType == _ELEMENT_NODE){
          //log('Recursing on :' + DOM_Node.tagName);
          
          if(_isDef(DOM_Node.dataset[_MODEL_ATTRIB_REPEAT_KEY])){
            modelNameParts = Process.parseModelAttribName(DOM_Node.dataset[_MODEL_ATTRIB_REPEAT_KEY]);
            modelName = modelNameParts[0];
            attribName = modelNameParts[1];
          }
          /*Annotate Control Node*/
          /*DOM_Node control value is annotated with model, attrib, and index data that is used to id and delete
            during preprocessing. Once we reach that node during recursive compiling, we create a ControlNode
            using the annotated data and add it to our control list*/
          compileMe = Process.preProcessNode(DOM_Node, modelName, attribName, scope);
           //1 = ctrl name, 3 = mdlName, 4 = attribName, 6 = index 
          if(_isDef(DOM_Node.dataset[_CTRL_KEY]) 
            && (ctrlRegexResult = /(\w+)(\|(\w+)\.(\w+)(\.(\d+))*)*/g.exec(DOM_Node.dataset[_CTRL_KEY])) !== null){
            controlNode = new ControlNode(DOM_Node, ctrlRegexResult[1], ctrlRegexResult[3],ctrlRegexResult[4],ctrlRegexResult[6] );
            controlNode.scope = scope;
            Map.addControlNode(controlNode);
          }
          
          /*Repeat base nodes serve as templates and should remain uncompiled*/
          if(compileMe  == true)
            this.compile(DOM_Node, scope);
        }
        
    }

    return scope;
          
  }
};

/*****************MODEL*****************************************/
var Model = function(modelName ,modelObj){
  if(!(this instanceof Model)){
    return new Model(modelObj);
  }

  this.modelName = modelName;
  for(var attrib in modelObj){
    
    if(modelObj.hasOwnProperty(attrib)){

      Object.defineProperty(this, attrib, {
        /*Closure is needed to bind 'attrib' value to each get/set. If we use attrib from Model scope
          it will always be the last value of the iteration*/
        set : (function(attrib, model){
                return function(value){
                  _log('SET FIRED for ' + model.modelName + '.' + attrib);
                  /* Since clobber assignment request - clear attribute meta-data
                  
                  kill old limit and page num on reassingment*/
                  if(_isDef(model.limitTable[attrib])){
                    delete model.limitTable[attrib];
                  }
                  
                  /*kill old static filter results as dataset has changed*/
                  if(_isDef(model.filterResults[attrib])){
                    delete model.filterResults[attrib];
                  }
                  
                  /*kill cached filter results as dataset has changed*/
                  if(_isDef(model.cachedResults[attrib])){
                    delete model.cachedResults[attrib];
                  }
                  
                  Map.setAttribute(model.modelName, attrib, value);
                  Interpolate.interpolate(model.modelName, attrib, value);
                }
              })(attrib, this),
        get : (function(attrib, model){
                return function(){
                  return Map.getAttribute(model.modelName, attrib);
                }
              })(attrib, this)
        
      });

    }
  }
  
  this.attributes = modelObj;
  /*holde intra-filter results. eg, between subsequent 'and's of a filter() call */
  this.cachedResults = Object.create(null);
  this.filterResults = Object.create(null);
  this.limitTable = Object.create(null);
  this.liveFilters = Object.create(null);
};
/************************GENERAL************************************/
/*Non-clobbering updating of interface using new data. Note that */
/*public*/
Model.prototype.softset = function(attribName, value){
  this.cachedResults[attribName] = value;
  Interpolate.interpolate(this.modelName, attribName, value);
  delete this.cachedResults[attribName];
  if(_isDef(this.limitTable[attribName])){
    this.limitTable[attribName].page = 1;
  }
};

Model.prototype.update = function(attribName){
  Interpolate.interpolate(this.modelName, attribName, Map.getAttribute(this.modelName, attribName));
};
/*public*/
Model.prototype.listen = function(attributeName, listener, pushDuplicate){
  Map.setListener(this.modelName, attributeName, listener, pushDuplicate);
};

/*******************FILTERING*************************************/
/*INTERNAL*/
Model.prototype.filterWarapper = function(/*req*/attribName, /*nullable*/property, /*nullable*/input, filterFunc
                                        , clearCachedResults, storeFilterResults, isInputFilter){
  /*make sure getAttribute() returns the full array to filter against, unless clearCachedResults is true
    this is used to differentiate between filters that watch live attributes and those that filter data statically.
    Live filter shouldn't used cached results on every filter; rather they should check the whole set with each update.
  */
  if(_isDef(clearCachedResults) && clearCachedResults  == true)
    delete this.cachedResults[attribName];
  /*if we fail input filter we should restore he attribute to original state*/
  if(_isDef(isInputFilter) && isInputFilter == true){
    if(filterFunc.call(null, input) == false){
      if(_isNullOrEmpty(input))
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
      filterResults = null;
  
  target = Map.getPageSlice(Model, attribName, target);
  
  if(_isArray(target)){
  
    for(var i = 0; i < target.length; i++){
      item = target[i];
      if(!_isNullOrEmpty(property) && _isDef(item[property])){
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
                        filterFunc.call(null, input, itemValue );
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
      if(_isDef(storeFilterResults) && storeFilterResults  == true)
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
      storeFilterResults = void(0);
  
  chain.propName = '';
  chain.isStatic = false;
  chain.liveAndFuncs = [];
    chain.using = function(atrribNameOrFunction){
      if(_isFunc(atrribNameOrFunction)){
        /*Static Filter
          Function take a single arg which is list element, returns bool a < 5 for example*/
          clearCachedResults = false;
          storeFilterResults = true;
          chain.isStatic = true;
        Model.filterWarapper(attribName, chain.propName, null, atrribNameOrFunction, clearCachedResults, storeFilterResults);
      }
      else{
        if(!_isDef(Model.liveFilters[attribName])){
          Model.liveFilters[attribName] = [];
        } 
        
        Model.liveFilters[attribName].push(atrribNameOrFunction);
        
        /*Live Filter*/
        Model.listen(atrribNameOrFunction, function(data){
          /*clear results when we have no chained 'and' functions*/
          clearCachedResults = (chain.liveAndFuncs.length < 1);

          var passedInputFilter = true,
              defaultFilterOverride = false;
          /*Filter with live 'and' functions*/
          for(var i = 0; i < chain.liveAndFuncs.length && passedInputFilter == true; i++){
            var isInputFilter = (chain.liveAndFuncs[i].length == 1);
            passedInputFilter = chain.liveAndFuncs[i].funct.call(null, data.text, chain.propName, isInputFilter);
            defaultFilterOverride |= !isInputFilter; 
          }
          _log('defaultFilterOverride: ' + defaultFilterOverride);
          /*if we passed input filter, we shoould move on to default filter*/
          if(passedInputFilter == true && defaultFilterOverride == false){
            /*default filter for model attribute is a 'startsWith' string compare*/
            Model.filterWarapper(attribName, chain.propName, data.text, function(input, item){
              return (!_isNullOrEmpty(item) && !_isNullOrEmpty(input) && item.toString().toLowerCase().indexOf(input.toLowerCase()) == 0);
            }, clearCachedResults, storeFilterResults);
          }

        }, true);
      }
      
      return chain;  
    };
    
    chain.by = function(propName){
      chain.propName = propName;
      
      return chain;
    }
    /*'and' queries on live filters iterate the entire data set. */
    chain.and = function(comparitorFunc){
      if(_isFunc(comparitorFunc)){
        /*Live comparitors should take input*/
        chain.liveAndFuncs.push({ funct : function(input, propName, isInputFilter){
          storeFilterResults = chain.isStatic;
          clearCachedResults = isInputFilter;
          return Model.filterWarapper(attribName, propName, input, comparitorFunc, clearCachedResults, storeFilterResults, isInputFilter);
        }, length : comparitorFunc.length});
        
        /*push input filters to the front*/
        chain.liveAndFuncs.sort(function(a,b){
          return (a.funct.length != 1);
        });
        
        clearCachedResults = false;
        storeFilterResults = chain.isStatic;
        
        if( (storeFilterResults = chain.isStatic) == true){
          Model.filterWarapper(attribName, chain.propName, null, comparitorFunc, clearCachedResults, storeFilterResults);
        }
        
      }
      return chain;
    }

  return chain;
};
/*public*/
Model.prototype.resetLiveFiltersOf = function(attribName){
  var watching = null;
  if(_isDef(this.liveFilters[attribName])){
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

/*END Filtering*/
/*******************PAGNG**************************************/
/*public*/
Model.prototype.limit = function(attribName){
  var chain = Object.create(null),
      Model = this,
      modelAttrib = 0,
      totalPages = 0;
  chain.to = function(limit){
    if(limit > 0){
      delete Model.limitTable[attribName];
      modelAttrib = Map.getAttribute(Model.modelName, attribName);
      
      if(_isArray(modelAttrib)){
        totalPages = Math.floor(modelAttrib.length/limit);
        totalPages += ((modelAttrib.length%limit > 0) ? 1 : 0);
        Model.limitTable[attribName] = {limit : limit, page : 1, totalPages : totalPages, currentPage : 1};
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
    if(_isDef(limitTable) && pageNum > 0 && pageNum <= limitTable.totalPages){
      limitTable.page = pageNum;
      Interpolate.interpolate(Model.modelName, attribName, Map.getAttribute(Model.modelName, attribName));
    }
  };
  return chain;
};

Model.prototype.gotoNextPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_isDef(limitTable) && (limitTable.currentPage + 1 <= limitTable.totalPages )){
    Model.gotoPage(++limitTable.currentPage).of(attribName);
  }
};

Model.prototype.gotoPreviousPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_isDef(limitTable) && (limitTable.currentPage - 1 > 0 )){
    Model.gotoPage(--limitTable.currentPage).of(attribName);
  }
};

Model.prototype.currentPageOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_isDef(limitTable)){
    return limitTable.currentPage;
  }
};

Model.prototype.totalPagesOf = function(attribName){
  var Model = this,
      limitTable = Model.limitTable[attribName];
  if(_isDef(limitTable)){
    return limitTable.totalPages;
  }
};


/*******************SORTING**********************************/
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
  if(_isDef(pageNum) && _isDef(Model.limitTable[attribName]) && pageNum > 0){
    oldPageNum = Model.limitTable[attribName].page;
    Model.limitTable[attribName].page = pageNum;
    chain.target = Map.getPageSlice(Model, attribName, chain.target);
  }
  
  chain.propName = '';
  chain.prevProps = [];
  
  /*in a page sort chain.target is a slice of the full target*/
  chain.insertSortedSlice = function(targetSlice, Model, attribName, pageNum){
    /*Short circuit this so we don't set limitTable.page to undefined*/
    if(!_isDef(pageNum) || !_isDef(Model.limitTable[attribName]))
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
    if(points.start > -1 && !_isNull(targetSlice)){

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
        a = (!_isNull(chain.propName)) ? a[chain.propName] : a,
        b = (!_isNull(chain.propName)) ? b[chain.propName] : b,
        intA = parseInt(a),
        intB = parseInt(b),
        pastPropsAligned = true,
        sortAction = NO_CHANGE;
        
    if(!_isDef(a) || !_isDef(b)){
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
      
  if(_isDef(limitTable)){
    return Model.sort(attribName, limitTable.currentPage);
  }
}
/*END Sort*/


ControlNode.prototype.indexedWrapper = function(index, funct){
  if(_isDef(index) && index < this.controlBaseNodes.length){
    funct.call(null, this.controlBaseNodes[index]);
  }
  else {
    for(var i = 0; i < this.controlBaseNodes.length; i++){
      funct.call(null, this.controlBaseNodes[i]);
    }
  }
};

ControlNode.prototype.hide = function(index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, 'apl-hide', 'apl-show');
  });
};

ControlNode.prototype.show = function(index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, 'apl-show', 'apl-hide');
  });
};

ControlNode.prototype.addClass = function(addClass, index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, addClass, '');
  });
};

ControlNode.prototype.removeClass = function(removeClass, index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, '', removeClass);
  });
};

ControlNode.prototype.listenTo = function(childName){
  
  var chain = Object.create(null),
      Control = this;
      
  chain.forEvent = function(eventType, handler){
    /*For notes on what's happening here see Templar()*/
    var lateBind = (function(eventType, handler, childName, Control){
    
      var thisControlNode = null,
          thisChildNode = null;
          
      return function(){
        if(_isDef(childName)
           && !_isNull(Control.controlBaseNodes)
           && _isDef(Control.controlBaseNodes[0])
           && _isDef(Control.controlBaseNodes[0].childIds[childName])){
          
            for(var i = 0; i < Control.controlBaseNodes.length; i++){
              thisControlNode = Control.controlBaseNodes[i];
              
              for(var id in thisControlNode.childIds){
                
                if(id == childName){
                
                  thisChildNode = thisControlNode.childIds[id].node;
                  (function(handler, i, thisChildNode, thisControlNode){
                    
                    thisChildNode.addEventListener(eventType, function(e){
                      thisControlNode.childIds.event = e;
                      handler.call(null, thisControlNode.childIds, i);
                    });
                    
                  })(handler, i, thisChildNode, thisControlNode);

                }
                  
                  
              }
            }

          }
      };
    })(eventType, handler, childName, Control);
    
    Map.setListener(_SYSTEM_EVENT_TYPES.system, _SYSTEM_EVENT_TYPES.interpolation_done, lateBind, false, true );
    
  };
  
  return chain;
};

/*Will not work in client's onload functions. It will work in event-based functions. Shouldn't publish 
  in version 1 API.*/
ControlNode.prototype.forEach = function(func){
  var chain = Object.create(null),
      Control = this;
      
  if(_isNull(Control.controlBaseNodes))
    return;
  for(var i = 0; i < Control.controlBaseNodes.length; i++){
    func.call(null, i, Control.controlBaseNodes[i], Control.controlBaseNodes[i].childIds);
  }
};

ControlNode.prototype.listen = function(eventType, handler){
  var Control = this;
  var lateBind = (function(eventType, handler, Control){
      
      return function(){
        var thisBaseNode = null,
            thisChildNode = null;
            
        if(!_isNullOrEmpty(eventType) && _isFunc(handler) && !_isNull(Control.controlBaseNodes)){
        
          for(var i = 0; i < Control.controlBaseNodes.length; i++){

            (function(handler, i){
              
              Control.controlBaseNodes[i].node.addEventListener(eventType, function(e){
                Control.controlBaseNodes[i].childIds.event = e;
                handler.call(null, Control.controlBaseNodes[i].childIds, i);  
              });
              
            })(handler, i);
          }
          
          
        }
      };
    })(eventType, handler, Control);
    
  Map.setListener(_SYSTEM_EVENT_TYPES.system, _SYSTEM_EVENT_TYPES.interpolation_done, lateBind, false, true  );
  
  
};

var Route = {

  buildRouteLinkedList : function(route, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        parent = new RouteNode(),
        lastNode = parent,
        thisNode = parent,
        partial = (_isDef(partial)) ? partial : '',
        parts = route.trim().split('/').slice(1),
        nonTerminals = [];

    for(var i = 0; i < parts.length; i++){
      mappedVal += (ntRegex.test(parts[i])) ? _NON_TERMINAL : _TERMINAL;
      thisNode  = new RouteNode(parts[i], mappedVal.charAt(i));
      
      if(thisNode.type == NON_TERMINAL)
        nonTerminals.push(thisNode.value.split(':'));
      
      lastNode = lastNode.next = thisNode;
    }
    parent = parent.next;
    parent.signature = mappedVal;
    parent.partial = partial;
    parent.length = parts.length;
    parent.route = route;
    parent.nonTerminals = nonTerminals;
   return parent;

  },
  
  buildRouteTree : function(routes){
    var  routeObj = Object.create(null),
         ambiguityTree = Object.create(null),
         normalizedName = null,
         routePartName = '',
         tmp = null,
         tat = null,
         terminalBranchCreated = false,
         nonAmbiguousBranchCreated = false,
         lookahead = null,
         route = '',
         parts = null,
         thisPart = '',
         thisType = null,
         nextPart = null,
         nextType = null;
  

  for(var i = 0; i < routes.length; i++){

    parts = routes[i].route.trim().split('/'); 
    tmp = routeObj;
    tat = ambiguityTree;
    
    for(var x = 0; x < parts.length; x++){
      /*this nullifies no leading / or trailing /*/
      if(parts[x] == '')
        continue;

      routePartName = parts[x].toLowerCase();
      thisType = (_NT_REGEX.test(parts[x])) ? _NON_TERMINAL : _TERMINAL;
      nextPart = (x+1 < parts.length) ? parts[x+1] : null;
      nextType = (!_isNull(nextPart)) ? 
        (_NT_REGEX.test(nextPart)) ? _NON_TERMINAL : _TERMINAL : null;
        
      /*Basically we flatten the tree by normalizing NT names*/
      normalizedName = (_NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
      
      if(!_isDef(tmp[routePartName])){
        tmp[routePartName] = Object.create(null);
        tmp[routePartName].endOfChain = false;
        tmp[routePartName].lookaheadVal = (nextType == _NON_TERMINAL) ? nextPart : '';
        tmp[routePartName].lookaheadType = nextType;
        terminalBranchCreated = true; 
      }
      /*Make parallel tree with NT names normalized so they don't spawn branches. */
      if(!_isDef(tat[normalizedName])){
        tat[normalizedName] = Object.create(null);
        nonAmbiguousBranchCreated = true;
      }
      
      
      tmp = tmp[routePartName];
      tat = tat[normalizedName];
      
      route = routes[i].route;
                   
    }

    /*we can get away with not creatin a new branch if pattern before us has same pattern but longer*/
    if(!terminalBranchCreated && tmp.endOfChain == true){
      throw 'Error: Duplicate Route "' + routes[i].route + '" Detected';
    }

    if(!nonAmbiguousBranchCreated && tmp.endOfChain == true){
      throw 'Error: Ambiguous Route "' + routes[i].route + '" Detected';
    }
    
    tmp.endOfChain = true;
    tmp.route = route;
    tmp.partial = routes[i].partial;
    terminalBranchCreated = false;
    nonAmbiguousBranchCreated = false;
  }
  
  _log(routeObj);
  return routeObj;
  
  },
  
  resolveRoute : function(route, routeTree){
    var parts = route.trim().split('/'),
      nonTerminalValues = [],
      key = '',
      skipKeyAssignment = false;
  
    routePart = routeTree;
   
    for(var i = 0; i < parts.length; i++){
      
      if(parts[i] == '' || parts[i] == '#')
          continue;
          
      if(_isDef(routePart.lookaheadType) && routePart.lookaheadType == _NON_TERMINAL){
        key = routePart.lookaheadVal;
      }else{
        key = parts[i].toLowerCase();
      }
      
      routePart = routePart[key];
      
      if(!_isDef(routePart))
        throw 'Error: Route "' + route + '" not found';

    }
    
    if(routePart.endOfChain == true)
      _log('Route matched: ' + route + ' with ' + routePart.route);
    else
      throw ' > Route "' + route + '" not found';
      
    _log(routePart);
    _log(nonTerminalValues);
    }
  
};
/*#path-to-partial(/modelName:attribName)* */
Route.parse = function(path){
  var parts
};

var Templar = function(controlName){
  var control = new ControlNode(),
      lateBind = null;
    control.controlBaseNodes = Map.getBaseControls(controlName);
  /*This is primarily for repated controls which won't exist until AFTER interpolation. B/c they
    are objects we can bind an assignment that will happen later than the assignment in the controller.
    We late bind the binding of any listeners attached to controls. This is because those listeners will
    typically operate on children of a given control. Those children won't exist at the time of the client's
    listner bindings. By delaying the bind until the system notifies us all repeats are drawn (interpolation_done)
    , we can ensure that the client's listeners will have valid nodes to operate on.
    */
    
  var lateBind = (function(control, controlName){
      
      return function(){
        control.controlBaseNodes = Map.getBaseControls(controlName);
      };
    })(control, controlName);
    
  Map.setListener(_SYSTEM_EVENT_TYPES.system, _SYSTEM_EVENT_TYPES.interpolation_done, lateBind, false, true );  
    
  return control;
};

Templar._onloadHandlerMap = Object.create(null);
Templar.success = function(partialFileName, onloadFunction){
  if(!_isDef(this._onloadHandlerMap[partialFileName])){
    this._onloadHandlerMap[partialFileName] = [];
  }
  
  if(_isFunc(onloadFunction)){
    this._onloadHandlerMap[partialFileName].push(onloadFunction);
  }
};

Templar.getPartialOnlodHandler = function(partialFileName){
  var onloadHandlers = [];
  
  if(_isDef(this._onloadHandlerMap[partialFileName])){
      onloadHandlers = this._onloadHandlerMap[partialFileName];
  }
  return onloadHandlers;
};

Templar.getModel = function(modelName){
  return Map.getModel(modelName);
};

Templar.dataModel = function(modelName, modelObj){
  Map.initModel(new Model(modelName, modelObj));
};

Templar.Map = Map;
Templar.Route = Route;

var Link = {
  
  bindModel : function(){
    var updateObj = Object.create(null);
    /*get model name names*/
    Map.forEach(function(ctx, modelName){
      /*get model attribute names*/
      Map.forEach(modelName, function(ctx, attribName){
        Interpolate.interpolate( ctx.modelName, ctx.modelAtrribName, 
                                  Map.getAttribute(ctx.modelName,ctx.modelAtrribName));
      });
    });
    /*Control listeners should not fire until this system event is finished*/
    updateObj.caller = _SYSTEM_EVENT_TYPES.system;
    updateObj.type = _SYSTEM_EVENT_TYPES.interpolation_done;
    Interpolate.dispatchListeners(null, updateObj);
    //Map.setListener(_SYSTEM_EVENT_TYPES.system, _SYSTEM_EVENT_TYPES.interpolation_done )
  }
};




var Bootstrap = {

  asynGetPartial : function(fileName, callback, targetId, node){
    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.fileName = fileName;
    xhr.targetId = targetId;
    xhr.targetNode = node;
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4){   //if complete
        if(xhr.status !== 200){  //check if "OK" (200)
          //throw error
        }
      } 
    }

    xhr.open('get',  fileName, true);
    xhr.send();
  },
  /*handlers with same handler are not duplicate bound. handler needs to be defined on persistent
    object or global scope*/
  setTarget : function(e){
      State.target = (!_isNull(e.target.dataset[_TARGET_ATTRIB_KEY])) ? 
                            e.target.dataset[_TARGET_ATTRIB_KEY] : '';

  },
  
  fireOnloads : function(){
    var file = '',
        handlers = null;
    while( (file = State.onloadFileQueue.pop())){
      handlers = Templar.getPartialOnlodHandler(file);
      for(var i = 0; i < handlers.length; i++){
        handlers[i].call(null);
      }
    }
  },
  
  bindTargetSetter : function(){
    var aplLinkNodeList = document.getElementsByTagName('a');
        
    if(aplLinkNodeList != null){
      for(var i = 0; i < aplLinkNodeList.length; i++){
        aplLinkNodeList[i].addEventListener('click', this.setTarget);
      }
    }
    
  },
  /*Preloading audio players will hang the framework.*/
  loadPartialIntoTemplate : function(){
    var partialContents = this.responseText,
        fileName = this.fileName,
        targetId = (!_isNullOrEmpty(this.targetId)) ? 
                      this.targetId.replace('#','') : 'apl-content',
        targetNode = (!_isNull(this.targetNode)) ? this.targetNode : null,
        /*a partial can define parent template dom elements to be hidden*/
        aplHideNode = null,
        nodeToShow = null,
        defaultHiddenNodeList = null,
        defaultNodeToHide = null,
        existingOnloadFunction = window.onload,
        href = document.location.href,
        timestamp = new Date().getTime(),
        scope = fileName +  ' ' + timestamp;
        
    if(!_isNull(targetNode)){
      targetNode.innerHTML = partialContents;
    }else
    if((targetNode = document.getElementById(targetId)) != null){
      targetNode.innerHTML = partialContents;
    }

    aplHideNode = document.getElementById('apl-hide');
    
    /*Show nodes hidden from last partial load*/
      nodesPreviouslyHidden = State.aplHideList.split(_CLASS_SEPARATOR);
      for(var i = 0; i < nodesPreviouslyHidden.length; i++){
          nodeToShow = document.getElementById(nodesPreviouslyHidden[i]);
          DOM.modifyClasses(nodeToShow,'apl-show','apl-show,apl-hide');
        }

    if(!_isNull(aplHideNode)){
      State.aplHideList = aplHideNode.getAttribute('data-apl-hide');
      DOM.hideByIdList(State.aplHideList);
    }
    
    _log('Compiling <' + fileName + '> w/ scope <' + scope + '>');
    /*remove this pending comp*/
    State.compilationThreadCount--;
    
    Compile.compile( targetNode, scope );
    
    /*unhide target node after compilation*/
    DOM.modifyClasses(targetNode,'apl-show','apl-hide,apl-show');
    /*if a default-template tag found, recursive compilations will be spun off async during compile()
      .without a way to determine if there are still unfinished 'threads' we will interpolate multiple
      times and prematurely causing unecessary overhead and misfiring of our onload handlers. Dangers of
      multiple interps is tearing down/rebuilding repeats which destroys control nodes causing control failure*/
    if(State.compilationThreadCount <= 0){
      
      Map.pruneNodeTreeByScope( scope ); 
      Bootstrap.fireOnloads();
      Link.bindModel();
      Bootstrap.bindTargetSetter();
      State.compilationThreadCount = 0;
    }

  }
};


/******Initialization*******/

var existingOnloadFunction = window.onload || function(){};

window.onload = function(){
  var aplContentNode = document.getElementById('apl-content');
  
  existingOnloadFunction.call(null);
  /*Works back to IE 8*/
  window.onhashchange  = function(event) {
    var href = event.newURL.substring(event.newURL.indexOf('#')).replace('#', '');
    
    if( (event.newURL != event.oldURL)){
      /*Hide target node, we will unhide after compilation. Prevents seeing uncompiled template*/
      var targetId = (!_isNullOrEmpty(State.target)) ? 
                      State.target.replace('#','') : 'apl-content',
          targetNode = document.getElementById(targetId);
          
      DOM.modifyClasses(targetNode,'apl-hide','');
      State.onloadFileQueue.push(href);
      Bootstrap.asynGetPartial(href, Bootstrap.loadPartialIntoTemplate, State.target);
    }

  };

  Compile.compile( document.getElementsByTagName('body')[0], 'body' ); 
  var defaultHiddenNodeList = document.querySelectorAll('.apl-default-hidden');
  if(!_isNull(defaultHiddenNodeList)){
    for(var i = 0; i < defaultHiddenNodeList.length; i++){
      defaultNodeToHide = defaultHiddenNodeList[i];
      DOM.modifyClasses(defaultNodeToHide,'','apl-default-hidden');
    }
  }

  _log('Body COMPILATION DONE');
};

/*Put in structureJS module chain if SJS is defined, otherwise export into global NS as 
  Templar

  NOTE: The global export functionality is NOT tested yet.

*/
if(_isDef(window['structureJS'])){
  structureJS.module('Templar', function(){return Templar});
}else{
  window['Templar'] = Templar;
}


})();



















