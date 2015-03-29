structureJS.module('Interpolate', function(require){

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var Process = require('Process');
var System = require('System');
var Circular = structureJS.circular();

return {

  dispatchListeners : function(listeners, data){

    if(_.isDef(listeners) && State.dispatchListeners == true){
      for(var id in listeners){
        if(_.isFunc(listeners[id])){
          listeners[id].call(null, data);
        }
      }
    }

  },
  
  dispatchSystemListeners : function(type){
    if(!_.isNullOrEmpty(type)){
      var listeners = System.getSystemListeners(type),
          systemId = _.SYSTEM_EVENT_TYPES.system;
          
      if(_.SYSTEM_EVENT_TYPES.LIST_TYPE == _.QUEUE){
        for(var i = 0;i < listeners.length; i++){
          if(_.isFunc(listeners[i])){
            listeners[i].call(null);
          }
        }
      }else if(_.SYSTEM_EVENT_TYPES.LIST_TYPE == _.STACK){
        for(var i = listeners.length - 1;i >= 0; i--){
          if(_.isFunc(listeners[i])){
            listeners[i].call(null);
          }
        }
      }
      
    }
  },
  
  updateNodeAttributes : function(tmp_node, modelName, attributeName){
    var updateObject = {};
    var node = tmp_node.node;
    if(node.hasAttributes() && tmp_node.isComponent == false){
      var intermediateValue = '',
          uninterpolatedString = '',
          elemAttribName = '',
          currAttribVal = '',
          elemAttributes = node.attributes,
          component,
          key,
          tokens;
      
      for(var i = 0; i < elemAttributes.length; i++){
        elemAttribName = elemAttributes[i].name;

        uninterpolatedString = (_.isDef(tmp_node.symbolMap[elemAttribName])) ? 
                                  tmp_node.symbolMap[elemAttribName] :
                                  '';
        /*short circuit: is this model attribute's non-terminal in the node attributes string?
          during compilation, any node with a non-terminal is annotated w/ a symbol map*/
        if(!_.isNullOrEmpty( uninterpolatedString = tmp_node.symbolMap[elemAttribName]  ) ){
          /*get each non-terminal then, using text replacement, we update the node attribute
            value*/
            
          tokens = Circular('Compile').getTokens( uninterpolatedString );
          for(var x = 0; x < tokens.length; x++ ){
            currAttribVal = Map.dereferenceAttribute(tokens[x]);
            intermediateValue = uninterpolatedString.replace(tokens[x].fullToken, currAttribVal );
            uninterpolatedString = intermediateValue;
          }
          
          node.setAttribute(elemAttribName, intermediateValue);
          updateObject[elemAttribName] = intermediateValue;
        }
      }
    }else if(tmp_node.isComponent == true){
      component = Templar._components[tmp_node.componentName];
      /*Due to the way Process.preProcessNodeAttribute() works a component's symbolMap
        will have a single key. This key can be used to tell us which update function to
        run. This sinlge key situation is not the case w/ non-component tmp's as they can
        have multiple keys (aka multiple attributes-per-node that need interpolation)*/
      if( 
          (key = Object.keys(tmp_node.symbolMap)).length > 0 
          && !_.isNullOrEmpty(attribVal = Map.getAttribute(modelName, attributeName))
        ){
        node.setAttribute(key[0], attribVal);
      }

    }

    return updateObject;
  },
  interpolateSpan : function(tmp_node){
    var node = tmp_node.node;
    node.innerText = node.innerHTML = 
      Map.dereferenceAttribute(tmp_node) || '';

  },
  /*Returns the whole attribute if no limit is defined for this attribute*/
  getPageSlice : function(Model, attributeName, target){
    var start = 0,
        length = target.length,
        limit = 0, 
        page = 0,
        results = target;
    if(_.isDef(Model.limitTable[attributeName])){
      page = Model.limitTable[attributeName].page;
      limit = Model.limitTable[attributeName].limit;
      length = ((limit * page) <= target.length) ? 
               (limit * page) : target.length;
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
        
    if(_.isDef(Model.limitTable[attributeName])){
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
  /*TODO: COMMENT THIS*/
  interpolateEmbeddedRepeats : function(TMP_node, index){
    var baseNodes,
        TMP_repeatBaseNode,
        attributeVal,
        modelName,
        attributeName,
        parts;
        
    for(var modelAttrib in TMP_node.embeddedRepeats){
      if(TMP_node.embeddedRepeats.hasOwnProperty(modelAttrib)){
        
        parts = Process.parseModelAttribName(modelAttrib);
        modelName = parts[0];
        attributeName = parts[1];
        baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
        Map.pruneBaseNodes(baseNodes);
        /*In interpolate() the call to compile() preceeding  the call to this adds a
          baseNode to this attribs basenode array. The index of which corresponsd to
          the index of the repeated node. The point of doing it this way is to keep the
          baseNodes for embedded repeats intact so changes to those attribs can rebuild
          the embedded repeat(s) in place in their containing repetitions.*/
        if(!_.isNull(TMP_repeatBaseNode = baseNodes[index])){
          
          if(DOM.isVisible(TMP_repeatBaseNode.node.parentNode) && 
            _.isArray(attributeVal = Map.dereferenceAttribute(TMP_repeatBaseNode)))
          {

            /*rebuild new one*/
            for(var i = 0; i < attributeVal.length; i++){
              TMP_repeatedNode = Process.newPreProcessRepeatNode(TMP_repeatBaseNode, i);
              TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
              Map.pushNodes(TMP_repeatedNode);
              if(TMP_repeatedNode.hasNonTerminals == false)
                TMP_repeatedNode.node.innerHTML = attributeVal[i];
              TMP_repeatBaseNode.node.parentNode.insertBefore(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
              Circular('Compile').compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope);
            }
          }
          TMP_repeatBaseNode.node.setAttribute('style','display:none;'); 
        }
        
      }
      
    }
  
    
  },
  
  intializeSelect : function(tmp_node, ifEmbedded, modelAttribLength){
    var isEmbedded = (!_.isNullOrEmpty(tmp_node.repeatModelName) && !_.isNullOrEmpty(tmp_node.repeatAttribName));
        run = (ifEmbedded) ? (ifEmbedded && isEmbedded) : (!ifEmbedded && !isEmbedded);
    
    var attributeVal = Map.dereferenceAttribute(tmp_node),
        modelAttribLength, newNodeCnt, newNodeIndex, text, value,
        modelName = tmp_node.modelName,
        attributeName = tmp_node.attribName;
        
    (function(TMP_select){
      var attrib = Map.dereferenceAttribute(TMP_select),
          select = TMP_select.node;
          
      Object.defineProperty(attrib, 'current_selection', {
        configurable : true,
        set : function(value){
          if(value == '')
            return;
          var annotations = DOM.getDOMAnnotations(select);
          this._value_ = value;

          for(var s = 0; s < select.children.length; s++){
            if(select.children[s].value == value){
              select.selectedIndex = s;
              /*We want to reinterpolate the select on change of current_selection. we don't
                want to fire listeners on this interp due to the fact user is likely setting
                current_selection from a listener and we want to prevent infinite looping.*/
              State.dispatchListeners = false;
              Interpolate.interpolate(annotations.modelName, annotations.attribName);
              State.dispatchListeners = true;
              Interpolate.dispatchListeners(
                Map.getListeners(annotations.modelName, annotations.attribName)
                , {
                    type : _.MODEL_EVENT_TYPES.select_change
                    , value : select.children[s].value
                    , text : select.children[s].text
                    , index : select.selectedIndex
                  }
              );
              
            }
          }
        },
        get : function(){
          return this._value_;
        }
      });
    })(tmp_node);
    
    if(run && _.isArray(attributeVal)){
          
      /*New model data, longer than existing data, add extra nodes*/
      if(attributeVal.length > modelAttribLength){
        /*amount of nodes needed*/
        newNodeCnt = attributeVal.length - modelAttribLength;
        /*where to start the new indexes in the 'indexes' table*/
        newNodeIndex = attributeVal.length - newNodeCnt;

        for(var q = 0; q < newNodeCnt; q++, newNodeIndex++, modelAttribLength++){
          var tmp_option = new TMP_Node(document.createElement("option"),modelName, attributeName, newNodeIndex);
          tmp_option.inheritToken(tmp_node);
          tmp_option.node.text = ( _.isDef(text = attributeVal[newNodeIndex].text) ) ? text : attributeVal[newNodeIndex];
          tmp_option.node.value = ( _.isDef(value = attributeVal[newNodeIndex].value) ) ? value : attributeVal[newNodeIndex];
          tmp_node.node.appendChild(tmp_option.node);
          tmp_option.scope = tmp_node.scope;
          Map.pushNodes(tmp_option);
        }
      }
        
    }
  },
  
  interpolate : function(modelName, attributeName, attributeVal, compiledScopes){  
    if(!Map.exists(modelName))
      return;
      
    _.log('Attemping Interpolation ' + modelName + '.' + attributeName + ' for scopes ' + compiledScopes);
    var option = null;
        listeners = Map.getListeners(modelName, attributeName),
        Interpolate = this,
        attribCurrState = Map.getAttribute(modelName, attributeName),
        updateObject = Object.create(null),
        numNodesToAdd = 0,
        numNodesToRemove = 0,
        newNodeStartIndex = 0,
        TMP_repeatBaseNode = null,
        updateObj = Object.create(null),
        nodeScopeParts = null,
        node = null,
        tagName = '',
        attributes = null;
    /*Note that listeners are only fired for attribs that are in the nodeTree (ie, visible in the UI)*/
    Map.forEach(modelName, attributeName, function(ctx, tmp_node){
             
      /*On Link() only interp nodes belonging to the linked scope*/
      if(_.isDef(compiledScopes) && !Map.isInScopeList(tmp_node.scope, compiledScopes)){
        _.log('Not Interpolating '  + modelName + '.' + attributeName + ' for scope <' + tmp_node.scope + '> not in <' + compiledScopes +'>');
        return;
      }
        
      node = tmp_node.node;
      tagName = (tmp_node.isComponent == true) ? 'COMPONENT' : node.tagName;
      tagName = (Map.isRepeatedAttribute(modelName, attributeName) == true) ? 'REPEAT' : node.tagName;
      if(ctx.hasAttributes == true){
        updateObject = Interpolate.updateNodeAttributes(tmp_node, modelName, attributeName);
      } 
        
        
      switch(tagName){
        
        case 'SELECT':
          Interpolate.intializeSelect(tmp_node, false, ctx.modelAttribLength);
          break;
        case 'OPTION':
          if(_.isArray(attributeVal = Map.dereferenceAttribute(tmp_node))){
            if(attributeVal.length <= ctx.modelAttribLength && ctx.modelAttribIndex < attributeVal.length){
                node.text = ( _.isDef(text = attributeVal[ctx.modelAttribIndex].text) ) ? text : attributeVal[ctx.modelAttribIndex];
                node.value = ( _.isDef(value = attributeVal[ctx.modelAttribIndex].value) ) ? value : attributeVal[ctx.modelAttribIndex];
                node.parentNode.selectedIndex = 
                  (_.isDef(attributeVal[ctx.modelAttribIndex].selected) && attributeVal[ctx.modelAttribIndex].selected == true) ? 
                    ctx.modelAttribIndex : node.parentNode.selectedIndex;
              
            }
            updateObj.value = node.parentNode.options[node.parentNode.selectedIndex].value;
            updateObj.text = node.parentNode.options[node.parentNode.selectedIndex].text;
            updateObj.type = _.MODEL_EVENT_TYPES.interp_change;
            updateObj.index = node.parentNode.selectedIndex;
            updateObj._attrib_ = attributeVal;
            
            /*This is here & not in preProcess... b/c when attrib is replaced as
            is the case with a cascading select, the preProcessor isn't called again,
            and therefore the setter isn't fired*/
            
            
            /*New model data, shorter than existing data, kill extra nodes*/
            if(ctx.modelAttribIndex >= attributeVal.length){
              ctx.removeItem(ctx.index); /*from indexes[key] = []*/
              node.parentNode.removeChild(node);
            }
            
            
          
            
          }
          break;
        
        case 'SPAN':

          Interpolate.interpolateSpan(tmp_node);
          updateObj.text = node.innerText;
          updateObj.type = node.tagName.toLowerCase();
          break;
        case 'INPUT':
          attributes = DOM.getDOMAnnotations(tmp_node.node);
          /*A mismatch here means this tmp_node is in the cache for attribute processing
            . Such a node shouldn't update the DOM_node value or fire listeners.*/
          
          if(attributes.modelName == tmp_node.modelName 
             && attributes.attribName == tmp_node.attribName){
             
             /*array would mean bound to checkbox*/
            if(!_.isArray(attributeVal = Map.dereferenceAttribute(tmp_node)) && State.ignoreKeyUp == false){
              node.value = attributeVal;
            }
            
            updateObj.text = node.value;
            updateObj.type = node.tagName.toLowerCase();
            updateObj.target = node;
           }
          
          break;
        case 'TEXTAREA':
          tmp_node.node.value = attributeVal;
          updateObj.text = node.value;
          updateObj.type = node.tagName.toLowerCase();
          updateObj.target = node;
          break;
        case 'REPEAT':
          var TMP_newRepeatNode = null,
              TMP_repeatedNode = null,
              outerCtx = ctx,
              baseNodes = null,
              repeatStart = 0,
              repeatEnd = 0;
          /*cache and DOM housekeeping*/
          Map.destroyRepeatTree(modelName, attributeName);
          
          baseNodes = Map.getRepeatBaseNodes(modelName, attributeName);
          Map.pruneBaseNodes(baseNodes);

          for(var z = 0; z < baseNodes.length; z++){
            TMP_repeatBaseNode = baseNodes[z];
            if(baseNodes[z].node.parentNode)
              ctx.target.unshift(TMP_repeatBaseNode);

            if(DOM.isVisible(TMP_repeatBaseNode.node.parentNode) && 
              _.isArray(attributeVal = Map.dereferenceAttribute(TMP_repeatBaseNode)))
            {

              /*rebuild new one*/
              for(var i = 0; i < attributeVal.length; i++){
                TMP_repeatedNode = Process.newPreProcessRepeatNode(TMP_repeatBaseNode, i);
                TMP_repeatedNode.scope = TMP_repeatBaseNode.scope;
                Map.pushNodes(TMP_repeatedNode);
                if(TMP_repeatedNode.hasNonTerminals == false)
                  TMP_repeatedNode.node.innerHTML = attributeVal[i];
                TMP_repeatBaseNode.node.parentNode.insertBefore(TMP_repeatedNode.node, TMP_repeatBaseNode.node);
                Circular('Compile').compile(TMP_repeatedNode.node, TMP_repeatBaseNode.scope);
                Interpolate.interpolateEmbeddedRepeats(TMP_repeatBaseNode, i);
              }
            }
            TMP_repeatBaseNode.node.setAttribute('style','display:none;'); 
          }
          Map.pruneDeadEmbeds();
          Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.repeat_built); 
          System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.repeat_built);
          /*Stop outter loop. We build the updated repeat nodes in one pass*/
          outerCtx.stop = true;
          updateObj.type = 'repeat';
          updateObj.value = attributeVal;
          break;
        default:
          break;
        }
      
    });
    /*only dispatchListeners() for interps which change node values*/
    if(_.isDef(updateObj.type)){
    
      if(updateObj.type == _.MODEL_EVENT_TYPES.interp_change){
        updateObj._attrib_._value_ = updateObj.value;
      }
      
      Interpolate.dispatchListeners(listeners, updateObj);
    }
    
  }
  
};



});