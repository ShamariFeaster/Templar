(function(){
/*Constants and Utilities*/
var _MODEL_ATTRIB_KEY = 'aplAttrib',
  _MODEL_ATTRIB_REPEAT_KEY = 'aplRepeat',
  _TARGET_ATTRIB_KEY = 'aplTarget',
  _CTRL_KEY = 'aplControl',
  _CTRL_ATTRIB_STRING = 'data-apl-control',
  _TEXT_NODE = 3,
  _ELEMENT_NODE = 1,
  _UNINDEXED = -1,
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
    
  this.node = node;
  this.id = id;
  this.modelName = _isDef(modelName) ? modelName : '';
  this.attribName = _isDef(attribName) ? attribName : '';
  this.index = (_isDef(index))? index : -1;
  this.scope = '';
};
  
var DOM = {
  modifyClasses : function(node, add, remove){
    var nodeClassList = '',
        removeAsArray = remove.split(' ');
    
    if(node != null){
      /*getAttribute may return '' or null so we check below*/
      nodeClassList = node.getAttribute('class');
      nodeClassList = (_isNull(nodeClassList)) ? '' : nodeClassList;
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
      idListAsArray = commaSeparatedIdList.split(',');
      for(var i = 0; i < idListAsArray.length; i++){
        nodeToHide = document.getElementById(idListAsArray[i]);
        this.modifyClasses(nodeToHide,'apl-hide','apl-show,apl-hide');
        
      }
    }
  },
  appendTo : function(child, parent){  
    if(!_isDef(parent) || !_isDef(child))
      return;
    parent.parentNode.insertBefore(child, child.nextSibling);
  }
};  

var Map = (function(){
  var _map = Object.create(null);/*no prototype chain, better iteration performance >= IE9*/
  var _repeatTable = Object.create(null);/*modelName : { attribName : node}*/
  var _controlTable = Object.create(null);/*ctrlId : [ctrl1, ctrl2,......]*/
  return {
  buildAttribAlias : function(attribName){
    return '_' + attribName;
  },
  getRepeatBaseNode : function(modelName, attribName){
    var tmp_node = null;
    if(!_isDef(attribName) || !_isDef(modelName))
      return tmp_node;
      
    if(_isDef(_repeatTable[modelName]) && _isDef(_repeatTable[modelName][attribName]))
      return tmp_node = _repeatTable[modelName][attribName];
  
  },
  
  addRepeatBaseNode : function(tmp_node){
    if(!_isDef(_repeatTable[tmp_node.modelName])){
      _repeatTable[tmp_node.modelName] = Object.create(null);
    }
      _repeatTable[tmp_node.modelName][tmp_node.attribName] = tmp_node;
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
  getAttribute : function(modelName, attribName){
    var returnVal = null;
    if(_isDef(_map[modelName]) && _isDef(_map[modelName]['modelObj'][attribName])){
      returnVal = _map[modelName]['modelObj'][attribName];
    }
    
    /*We should always pull the filtered subset if a static filter has been applied*/
    if(_isDef(_map[modelName]['filterResults'][attribName])){
      returnVal = _map[modelName]['filterResults'][attribName];
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
  
  setListener : function(modelName, attributeName, listener, pushDuplicate){        
    if(_isFunc(listener)){
      var string = listener.toString(),
          id = string.length + string.charAt(string.length/2);
      if(_isDef(pushDuplicate) && pushDuplicate == true){
        id += Math.random();
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
  pruneControlNodes : function(tmp_node, modelName, attribName, index){
    var Map = this;
    /*Remove embedded controls*/  
      
    Map.Control.forEach(function(ctrlCtx, ctrlNode){
        if(ctrlNode.index == index && ctrlNode.modelName == modelName 
            && ctrlNode.attribName == attribName){
          _log('Pruning Controll Node ' + ctrlNode.node.tagName);
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
          Map.removeListener(ctx.modelName, ctx.modelAtrribName);
          
          Map.forEach(ctx.modelName, ctx.modelAtrribName, function(ctx, tmp_node){
            var node = tmp_node.node,
                repeatIndex = tmp_node.index;
            if(( nodeScopeParts = tmp_node.scope.split(' ')) !== null){
              if((nodeScopeParts[0] == scopeParts[0])){
                ctx.removeItem(ctx.index);
                Map.pruneControlNodes(tmp_node, ctx.modelName, ctx.modelAtrribName, repeatIndex );
                _log('pruning' + node.tagName + ' for ' + ctx.modelName + '.' + ctx.modelAtrribName);
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
  
  getRepeat : function(){
    return _repeatTable;
  },
  
  getControl : function(){
    return _controlTable;
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
        regex = /(\{\{(\w+\.\w+)(\[\d+\]\.zTMPzDot\w+)*\}\})/g,
        modelNameParts = null,
        tmp_node = null;
        
    if(node.hasAttributes()){
      attributes = node.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        /*disallow style and class interpolation*/
        if(attributes[i].name == 'style' || attributes[i].name == 'class'){
          continue;
        }
        
        while( (match = regex.exec(attributes[i].value)) != null ){
          modelNameParts = this.parseModelAttribName(match[2]); 
          tmp_node = new TMP_Node(node, modelNameParts[0], modelNameParts[1]);         
          tmp_node.symbolMap[attributes[i].name] = attributes[i].value;
          tmp_node.scope = scope;
          hasAttribNonTerminal = true;
          Map.pushNodes(tmp_node);
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
    
  },
  
  updateNodeAttributes : function(tmp_node, modelName, attributeName){
    var updateObject = Object.create(null);
    var node = tmp_node.node;
    if(node.hasAttributes()){
      var regex = /(\{\{(\w+\.\w+)\}\})/g, //result array -> [1] = {{a.b}}, [2] = a.b
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
        if(_isDef( uninterpolatedString ) 
            && uninterpolatedString.match(new RegExp('{{' + modelName + '.' + attributeName + '}}'))){
          /*get each non-terminal then, using text replacement, we update the node attribute
            value*/
          while(  (match = regex.exec(uninterpolatedString)) != null){
            modelNameParts = Process.parseModelAttribName(match[2]);
            currAttribVal = Map.getAttribute(modelNameParts[0], modelNameParts[1]);
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
              (page * limit) - limit : ((page * limit) - limit) - length;
      results = target.slice(start, length);
    }    
    
            
    return results;
  },
  interpolate : function(modelName, attributeName, attributeVal){  
    if(!Map.exists(modelName))
      return;
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
              Map.pruneControlNodes(tmp_node, modelName, attributeName, ctx.modelAttribIndex);
              node.parentNode.removeChild(node);
            }
            
            
          }
          break;
        
        case 'SPAN':

          Interpolate.interpolateSpan(tmp_node, attributeVal);
          updateObject.text = node.innerText;
          Interpolate.dispatchListeners(listeners, {type : node.tagName.toLowerCase(), text : updateObject.text});
          
          break;
          
        default:
          var TMP_newRepeatNode = null,
              outerCtx = ctx;
          if( !_isNull((TMP_repeatBaseNode = Map.getRepeatBaseNode(modelName, attributeName))) ){
            /*Kill existing repeat tree*/
            Map.forEach(modelName, attributeName, function(ctx, tmp_node){
              if(tmp_node.index > _UNINDEXED){
                Map.pruneControlNodes(tmp_node, modelName, attributeName, tmp_node.index);
                Map.pruneEmbeddedNodes(TMP_repeatBaseNode, modelName, attributeName, tmp_node.index);
                ctx.removeItem(ctx.index);
                tmp_node.node.parentNode.removeChild(tmp_node.node);
              }
              
            });
            

            var TMP_repeatedNode = null,
                Model = Map.getInternalModel(modelName),
                limit = 0, 
                page = 0;
            
            /*Get page, if limit has been defined*/    
            if(_isDef(Model.limitTable[attributeName]) && !_isDef(Model.cachedResults[attributeName])){
              page = Model.limitTable[attributeName].page;
              limit = Model.limitTable[attributeName].limit;
              attributeVal = Interpolate.getPageSlice(Model, attributeName, attributeVal);
            }
            
            
            
            /*rebuild new one*/
            for(var i = 0; i < attributeVal.length; i++){

              TMP_repeatedNode = Process.preProcessRepeatNode(TMP_repeatBaseNode, i);
              TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
              Map.pushNodes(TMP_repeatedNode);
              if(TMP_repeatedNode.hasNonTerminals == false)
                TMP_repeatedNode.node.innerHTML = attributeVal[i];
              DOM.appendTo(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
              Compile.compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope, true);
            }
            /*Stop outter loop. We build the updated repeat nodes in one pass*/
            outerCtx.stop = true;

          }
          break;
        }
      
    });
    
    Interpolate.dispatchListeners(listeners, updateObj);
    
  }
  
};

var Compile = {
  
  compile : function(root, scopeName, useGivenScope){
    
    var scope = (_isDef(useGivenScope))? scopeName : scopeName + ' ' + (new Date().getTime()).toString();
    
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
        NONTERMINAL_REGEX = /(\{\{(\w+\.\w+)(\[(\d)+\])*(?:\.)*(\w+)*?\}\})/g;
        
    if(typeof nodes == 'undefined' || nodes == null)
        return scope;

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
            this.compile(DOM_Node, scope, true);
        }
        
    }
    
    return scope;
          
  }
};


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
  this.cachedResults = Object.create(null);
  this.filterResults = Object.create(null);
  this.limitTable = Object.create(null);
};

Model.prototype.filterWarapper = function(/*req*/attribName, /*nullable*/property, /*nullable*/input, filterFunc
                                        , clearCachedResults, storeFilterResults){
  /*make sure getAttribute() returns the full array to filter against, unless clearCachedResults is true
    this is used to differentiate between filters that watch live attributes and those that filter data statically.
    Live filter shouldn't used cached results on every filter; rather they should check the whole set with each update.
  */
  if(_isDef(clearCachedResults) && clearCachedResults  == true)
    delete this.cachedResults[attribName];
  
  var Model = this,
      results = [],
      target = Map.getAttribute(Model.modelName, attribName);
  
  target = Interpolate.getPageSlice(Model, attribName, target);
  
  if(_isArray(target)){
  
    for(var i = 0; i < target.length; i++){
      item = target[i];
      if(!_isNullOrEmpty(property) && _isDef(item[property])){
        itemValue = item[property];
      }else{
        itemValue = item;
      }
      /*filter fun*/
      if(filterFunc.call(null, itemValue, input ) == true){
        results.push(item);
      }
    }
    
    /*empty set returned by filtering, kill cachedResults  but also set results to original set.*/
    if(results.length < 1){
      results = target;
      delete Model.cachedResults[attribName];
      /*get full attrib before interpolation. of importance with repeats during recompilation*/
      results = Map.getAttribute(Model.modelName, attribName);
    }else{
      /*cachedResults signals to getAttribute() to return these temp results during recompilation*/
      Model.cachedResults[attribName] = results;
      
      /*This subset is what's retrieved from now on, used in static filtering*/
      if(_isDef(storeFilterResults) && storeFilterResults  == true)
        Model.filterResults[attribName] = results;
    }
    Interpolate.interpolate(Model.modelName, attribName, results);
  }
};

/*Non-clobbering updating of interface using new data. Note that */
Model.prototype.softset = function(attribName, value){
  this.cachedResults[attribName] = value;
  Interpolate.interpolate(this.modelName, attribName, value);
  delete this.cachedResults[attribName];
};

Model.prototype.listen = function(attributeName, listener, pushDuplicate){
  Map.setListener(this.modelName, attributeName, listener, pushDuplicate);
};

Model.prototype.filter = function(attribName){
  var chain = Object.create(null),
      propName = '',
      itemValue = null,
      item = null,
      Model = this;
  
  chain.propName = '';
  
  
    chain.using = function(atrribNameOrFunction){
      if(_isFunc(atrribNameOrFunction)){
        /*Static Filter
          Function take a single arg, returns bool a < 5 for example*/
        Model.filterWarapper(attribName, chain.propName, null, atrribNameOrFunction, false, true);
      }
      else{
        /*Live Filter*/
        Model.listen(atrribNameOrFunction, function(data){
          /*default filter for model attribute is a 'startsWith' string compare*/
          Model.filterWarapper(attribName, chain.propName, data.text, function(item, input){
            return (_isString(item) && !_isNullOrEmpty(input) && item.toLowerCase().indexOf(input.toLowerCase()) == 0);
          }, true);

        }, true);
      }
      
      return chain;  
    };
    
    chain.by = function(propName){
      chain.propName = propName;
      
      return chain;
    }
    
    chain.and = function(comparitorFunc){
      if(_isFunc(comparitorFunc)){
        Model.filterWarapper(attribName, null, null, comparitorFunc, false, true);
      }
      return chain;
    }
    
  
  
  
  return chain;
};

Model.prototype.limit = function(attribName){
  var chain = Object.create(null),
      Model = this;
  chain.to = function(limit){
    Model.limitTable[attribName] = {limit : limit, page : 1};
  };
  return chain;
}

Model.prototype.gotoPage = function(pageNum){
  var chain = Object.create(null),
      Model = this;
  chain.of = function(attribName){
    if(_isDef(Model.limitTable[attribName]) && pageNum > 0){
      Model.limitTable[attribName].page = pageNum;
      Interpolate.interpolate(Model.modelName, attribName, Map.getAttribute(Model.modelName, attribName));
    }
  };
  return chain;
}

var Templar = {

  _onloadHandlerMap : Object.create(null),
  
  success : function(partialFileName, onloadFunction){
    this._onloadHandlerMap[partialFileName] = onloadFunction;
  },

  getPartialOnlodHandler : function(partialFileName){
    var onloadHandler = function(){};
    
    if(_isDef(this._onloadHandlerMap[partialFileName]) 
       && _isFunc(this._onloadHandlerMap[partialFileName])){
        onloadHandler = this._onloadHandlerMap[partialFileName];
    }
    return onloadHandler;
  },
  
  dataModel : function(modelName, modelObj){
    Map.initModel(new Model(modelName, modelObj));
  },

  getModel : function(modelName){
    return Map.getModel(modelName);
  },
  Map : Map,
  Interpolate : Interpolate
};

var Link = {

  bindModel : function(){
    /*get model name names*/
    Map.forEach(function(ctx, modelName){
      /*get model attribute names*/
      Map.forEach(modelName, function(ctx, attribName){
        Interpolate.interpolate( ctx.modelName, ctx.modelAtrribName, 
                                  Map.getAttribute(ctx.modelName,ctx.modelAtrribName));
      });
    });
  }
};

var State = {
  isLinkloading : false,
  isFirstPartialLoad : true
};

var Bootstrap = {

  asynGetPartial : function(fileName, callback, targetId){
    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.onload.fileName = fileName;
    xhr.onload.targetId = targetId;
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
  
  bindLinkListener : function(){
    var aplLinkNodeList = document.querySelectorAll('.apl-link'),
        aplLinkNode = null,
        aplLinkHref = '';

    if(aplLinkNodeList != null){
      for(var i = 0; i < aplLinkNodeList.length; i++){
        aplLinkNodeList[i].addEventListener('click', this.partialLinkLoadHandler);
      }
    }
  },
  
  loadPartialIntoTemplate : function(){
    var partialContents = this.responseText,
        fileName = this.onload.fileName,
        targetId = (_isDef(this.onload.targetId)) ? this.onload.targetId.replace('#','') : 'apl-content',
        targetNode = null,
        /*a partial can define parent template dom elements to be hidden*/
        aplHideNode = null,
        /*aplHideNode will have a data element with comma-separated list of dom IDs*/
        aplHideList = '',
        nodeToShow = null,
        defaultHiddenNodeList = null,
        defaultNodeToHide = null,
        existingOnloadFunction = window.onload,
        href = document.location.href;
        /*add hash tag to href*/
        if(href.indexOf('#') != -1){/*if there isn't a hash already parse href and put hash at end*/
          document.location.href = href.substring(0, href.indexOf('#')) + '#' + fileName;
        }else{
          document.location.href = '#' + fileName;
        }
    /*bad targets don't do anything*/    
    if( (targetNode = document.getElementById(targetId)) != null){
      targetNode.innerHTML = partialContents;
    }

    aplHideNode = document.getElementById('apl-hide');
    
    /*Show nodes hidden from last partial load*/
      nodesPreviouslyHidden = _classesSetToHide.split(',');
      for(var i = 0; i < nodesPreviouslyHidden.length; i++){
          nodeToShow = document.getElementById(nodesPreviouslyHidden[i]);
          DOM.modifyClasses(nodeToShow,'apl-show','apl-show,apl-hide');
          
        }

    if(aplHideNode != null){
      aplHideList = _classesSetToHide = aplHideNode.getAttribute('data-apl-hide');
      DOM.hideByIdList(aplHideList);
      /*This handles case of the first page loaded needs to hide template elements. Unfortunately
        we have to use hard coded 'hide' classes in the template to keep the elements intended to
        be hidden from flashing until the default partial loads and instructs APL to hide stuff. As
        soon as we navigate away from our inital template load we need to remove the special hard
        coded class. We used state to do this, which is obviously undesirable. For now, it will
        until a better solution  is found.*/
        
      if(State.isFirstPartialLoad == true){
        State.isFirstPartialLoad = false;
        
        defaultHiddenNodeList = document.querySelectorAll('.apl-default-hidden');
        if(defaultHiddenNodeList != null){
          for(var i = 0; i < defaultHiddenNodeList.length; i++){
            defaultNodeToHide = defaultHiddenNodeList[i];
            DOM.modifyClasses(defaultNodeToHide,'','apl-default-hidden');
          }
        }
      }
      
    }
    Map.pruneNodeTreeByScope( fileName +  ' ' + 'timestamp'  ); 
    Compile.compile( targetNode, fileName );
    
    Link.bindModel();
    Bootstrap.bindLinkListener();
    
    Templar.getPartialOnlodHandler(fileName).call(null);
    State.isLinkloading = false;
  },
  partialLinkLoadHandler : function(e){
    State.isLinkloading = true;
    var aplLinkHref = e.target.getAttribute('href').replace('#','');
    
    if(!_isNullOrEmpty(aplLinkHref)){
      Bootstrap.asynGetPartial(aplLinkHref, Bootstrap.loadPartialIntoTemplate, e.target.dataset[_TARGET_ATTRIB_KEY]);
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
    var href = event.newURL;

    if( (event.newURL != event.oldURL) && State.isLinkloading == false){
      Bootstrap.asynGetPartial(href.substring(href.indexOf('#')).replace('#', ''), Bootstrap.loadPartialIntoTemplate);
    }
  };

  Compile.compile( document.getElementsByTagName('body')[0], 'body' ); 
  Link.bindModel();

  if(aplContentNode != null){//data-apl-default
    var defaultPartialHref = aplContentNode.getAttribute('data-apl-default');
    if(!_isNullOrEmpty(defaultPartialHref)){
      Bootstrap.asynGetPartial(defaultPartialHref,Bootstrap.loadPartialIntoTemplate );
    }
  }
  
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



















