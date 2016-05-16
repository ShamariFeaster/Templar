window.structureJS.module('Compile', function(require){

'use strict';

var _ = this;
var TMP_Node = require('TMP_Node');
var Map = require('Map');
var DOM = require('DOM');
var Interpolate = require('Interpolate');
var Process = require('Process');
var State = require('State');
var Token = require('Token');
var Circular = window.structureJS.circular();

return {

  getTokens : function(input, isWithoutBraces){
    var modelNameParts; 
    var token = new Token();
    var match = null;
    var match2 = null;        
    var tokens = [];
    var pattern1 = _.RX_TOKEN;
    var pattern2 = _.RX_ALL_INX;
    var indexes = null;
    var prop = null;
    var annotationString = null;
    var annotations = null;
        
    if(_.isDef(isWithoutBraces) && isWithoutBraces === true){
      pattern1 = _.RX_RPT_M_ATTR;
      pattern2 = _.RX_RPT_ALL_INX;      
    }
    
    pattern1.lastIndex = 0;
    pattern2.lastIndex = 0;
    _.RX_IDX_ITER.lastIndex = 0;
    _.RX_ANNOT.lastIndex = 0;

    while((match = pattern2.exec(input)) !== null){
      indexes = null;
      annotationString = (_.isDef(match[3])) ? match[3] : '';
      annotations = null;
          
      token.start =  match.index;
      token.end =  pattern2.lastIndex;
      token.fullToken =  match[1];
      
      if(  (match2 = pattern1.exec(token.fullToken)) !== null){
        modelNameParts = Process.parseModelAttribName(match2[1]); 
        token.modelName =  modelNameParts[0];
        token.attribName =  modelNameParts[1];
      }
      
      while((indexes = _.RX_IDX_ITER.exec(match[3])) !== null){
        
        prop = (!_.isDef(indexes[1])) ? indexes[2] : indexes[1];
        token.indexQueue.push(prop);
      }
      
      while((annotations = _.RX_ANNOT.exec(annotationString)) !== null){
        switch(annotations[1]){
          case 'mdl':
            token.repeatModelName = annotations[2];
            break;
          case 'att':
            token.repeatAttribName = annotations[2];
            break;
          case 'i':
            token.repeatIndex = annotations[2];
            break;
        }
      }
      tokens.push(token);
      token = new Token();
    }
    
    return tokens;
  },
  
  getRepeatToken : function(input){
    return this.getTokens(input, true);
  },
  
  getAllTokens : function(input){
    var mustachetokens = this.getTokens(input);
    var allTokens = (mustachetokens.length < 1) ? this.getRepeatToken(input) : mustachetokens;
    return allTokens;
  },
  
  //this is DOM_Node setAttribute is being called on
  setAttributeOverride : function(name, val){
    var component = this.tmp_component;
    var updateFunc = null;

    if(_.isFunc(updateFunc = component.attributes[name])){
      updateFunc.call(component, this, val);
    }
    
    if(_.isDef(this._setAttributeWrapper)){
      this._setAttributeWrapper.call(this,name, val);
    }else{
      this._setAttribute.call(this,name, val);
    }
            
  },
  
  bindComponentOnChangeHandler : function(DOM_component, component){
    DOM_component.addEventListener("DOMCharacterDataModified", function(event){
      component.onChange.call(component, this, event);
    });
  },
  
  compile : function(root, scope, repeatIndex){
  
    if(_.isNull(root) || _.isNull(root.childNodes)) {
      return scope;
    }
    
    repeatIndex = (_.isInt(repeatIndex)) ? parseInt(repeatIndex) : -1;

    var defaultPartialHref = root.getAttribute('data-apl-default');
    var id = root.getAttribute('id');
    var shortCircuit = (State.blockBodyCompilation === true && id === _.MAIN_CONTENT_ID);
    var nodes = root.childNodes;
    var tokens = [];
    var splitNode = null;
    var span = null;
    var parentNode = null;
    var DOM_Node = null;
    var tmp_node = null;
    var prevLength = 0;
    var text = '';
    var parentTagName = '';
    var modelName = ''; 
    var attribName = '';


    var __COMPILER_FLG__ = _.NO_COMPILE_ME;
    
    if(!_.isNullOrEmpty(defaultPartialHref) && !shortCircuit){
      root.setAttribute('data-apl-default', '');
      DOM.asynGetPartial(defaultPartialHref, Circular('Bootstrap').loadPartialIntoTemplate, null, root );
      _.log('Spawning Thread <' + defaultPartialHref + '> w/ target <' + root.id + '> w/ scope <' + scope + '>');
    }

    for(var i = 0; i < nodes.length; i++){
      DOM_Node = nodes[i];
      parentNode = DOM_Node.parentNode;
      
      //option innerText should not be compiled
      if(DOM_Node.nodeType === _.TEXT_NODE && (!_.isNull(parentNode) && parentNode.tagName !== 'OPTION') ){
        text = DOM_Node.nodeValue;
        //changed from getTokens() on 5/16/2016
        tokens = this.getAllTokens(text);
        
        //splitNode is right split, DOM_Node is left of split (ie original DOM_Node)

        for(var x = 0; x < tokens.length; x++){
          parentTagName = parentNode.tagName;
          modelName = tokens[x].modelName;
          attribName = tokens[x].attribName;
          
          span = document.createElement('span');

          tmp_node = new TMP_Node(span, modelName, attribName);
          tmp_node.inheritToken(tokens[x]);
          tmp_node.scope = scope;
          tmp_node.index = repeatIndex;
          
          splitNode = DOM.splitText(DOM_Node, tokens[x].start - prevLength);

          prevLength += DOM_Node.nodeValue.length;

          if(splitNode.nodeValue.trim() == tokens[x].fullToken){
            tmp_node.node.innerText = splitNode.nodeValue;
            Interpolate.interpolateSpan(tmp_node);
            parentNode.replaceChild(tmp_node.node, splitNode);
            Map.pushNodes(tmp_node);             
          }
          if(DOM_Node.nodeValue.trim() == tokens[x].fullToken){
            tmp_node.node.innerText = DOM_Node.nodeValue;
            Interpolate.interpolateSpan(tmp_node);
            parentNode.replaceChild(tmp_node.node, DOM_Node);
            Map.pushNodes(tmp_node); 
          }
          DOM_Node = nodes[++i];
          
          if(DOM_Node.nodeType != _.TEXT_NODE){
            break;
          }
              
          splitNode = DOM.splitText(DOM_Node, tokens[x].end  - prevLength);
          prevLength += DOM_Node.nodeValue.length;
          
          if(splitNode.nodeValue.trim() == tokens[x].fullToken){
            tmp_node.node.innerText = splitNode.nodeValue;
            Interpolate.interpolateSpan(tmp_node);
            parentNode.replaceChild(tmp_node.node, splitNode);
            Map.pushNodes( tmp_node); 
          }
          if(DOM_Node.nodeValue.trim() == tokens[x].fullToken){
            tmp_node.node.innerText = DOM_Node.nodeValue;
            Interpolate.interpolateSpan(tmp_node);
            parentNode.replaceChild(tmp_node.node, DOM_Node);
            Map.pushNodes( tmp_node ); 
          }
          
          DOM_Node = nodes[++i];

          if(DOM_Node.nodeType != _.TEXT_NODE){
            break;
          }
            
        }
        tokens.length = 0;
        prevLength = 0;
      }else if(DOM_Node.nodeType === _.ELEMENT_NODE){
      
        // TODO: Move to 'Component' Class Initial component replacement
        var componentName = DOM_Node.tagName.toLowerCase();
        var component = window.Templar._components[componentName]; 
        var DOM_component = null;
        var TMP_processed_components = null;
        var repeatKey;
        var beforeInsertNodeCnt = nodes.length;
        var addedNodecnt = 0;
        
        if(_.isDef(component) && !_.isNullOrEmpty(component.templateContent) && !_.isNull(DOM_Node.parentNode)){

          DOM_Node.insertAdjacentHTML('afterend', component.templateContent);
          addedNodecnt = nodes.length - beforeInsertNodeCnt;
          DOM_component = DOM_Node.nextElementSibling;
          DOM_component.scope = scope;
          
          /*Transclude content*/
          if(component.transclude === true){
            var contentNode;
            if(!_.isNullOrEmpty(contentNode = DOM_component.getElementsByTagName('CONTENT'))){
              contentNode = contentNode[0];
              for(var q = 0; q < DOM_Node.childNodes.length; q++){
              
                if(!_.isNull(contentNode.parentNode)){
                  contentNode.parentNode.insertBefore(DOM_Node.childNodes[q], contentNode);
                }
                
                //Live list, insertBefore() shortents childNodes by 1
                q--;
              }
              
              if(!_.isNull(contentNode.parentNode)){
                contentNode.parentNode.removeChild(contentNode);
              }
              
            }
          }
          
          DOM_component.tmp_component = component;
          
          //probably unecessary
          DOM.cloneAttributes(DOM_Node, DOM_component, true);

          TMP_processed_components = Process.preProcessNodeAttributes(DOM_component, scope, repeatIndex);
          
          if(_.isDef(DOM_component._setAttribute)){
            DOM_component._setAttributeWrapper = DOM_component.setAttribute;
          }else{
            DOM_component._setAttribute = DOM_component.setAttribute;
          }
          
          DOM_component.setAttribute = this.setAttributeOverride;
          
          /*Strange lesson here. The iter variable was named 'i'. This 'i' was clobbering
              the value of the main loop's 'i' and 'sending the main loop back in time'. */
          for(var z = 0; z < TMP_processed_components.length; z++){
            TMP_processed_components[z].isComponent = true;
            TMP_processed_components[z].componentName = componentName;
          }
          
          /*fire onCreate*/
          component.onCreate.call(component, DOM_component);
          
          if(_.isNotNull(component.onChange)){
            this.bindComponentOnChangeHandler(DOM_component, component );
          }
          
          if(_.isNotNull(component.onDone)){
            component.target = DOM_component;
            component.onDone.context = component;
            window.Templar.done(component.onDone);
          }
          
          
          repeatKey = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);
          DOM_Node.parentNode.removeChild(DOM_Node);
          DOM_Node = DOM_component;
          if(!_.isNullOrEmpty(repeatKey)){
            DOM_Node.setAttribute('data-' + _.IE_MODEL_REPEAT_KEY, repeatKey);
          }
          //make sure we don't recompile this node
          i += addedNodecnt-1;
        }

        repeatKey = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);

        if(!_.isNullOrEmpty(repeatKey) && (tokens = this.getRepeatToken(repeatKey)).length > 0){
          DOM.annotateDOMNode(DOM_Node, tokens[0].modelName, tokens[0].attribName, tokens[0] );
        }
        
        __COMPILER_FLG__ = Process.preProcessNode(DOM_Node, scope, repeatIndex);
        
        /*Repeat base nodes serve as templates and should remain uncompiled*/
        switch(__COMPILER_FLG__){
          case _.COMPILE_ME:
            this.compile(DOM_Node, scope, repeatIndex);
            break;
          case _.NO_COMPILE_ME:
            /*noop*/
            break;
          case _.RECOMPILE_ME:
            i--;
            break;
        }
      
      }
    }

    return scope;
          
  }
};


});