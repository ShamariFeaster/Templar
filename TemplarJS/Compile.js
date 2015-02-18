structureJS.module('Compile', function(require){

var _ = this;
var TMP_Node = require('TMP_Node');
var ControlNode = require('ControlNodeHeader');
var Map = require('Map');
var DOM = require('DOM');
var Interpolate = require('Interpolate');
var Process = require('Process');
var State = require('State');
var Circular = structureJS.circular();

return {
  compile : function(root, scope){
  
    if(_.isNull(root) || _.isNull(root.childNodes))
      return scope;

    var defaultPartialHref = root.getAttribute('data-apl-default');

    if(!_.isNullOrEmpty(defaultPartialHref)){
      root.setAttribute('data-apl-default', '');
      State.compilationThreadCount++;
      State.onloadFileQueue.push(defaultPartialHref);
      DOM.asynGetPartial(defaultPartialHref, Circular('Bootstrap').loadPartialIntoTemplate, null, root );
      _.log('Spawning Thread <' + defaultPartialHref + '> w/ target <' + root.id + '> w/ scope <' + scope + '>');
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
        if(DOM_Node.nodeType == _.TEXT_NODE && (!_.isNull(parentNode) && parentNode.tagName !== 'OPTION') ){
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
            index = (_.isDef(partMap[x]['index'])) ? parseInt(partMap[x]['index']) : -1;
            tmp_node = new TMP_Node(span, modelName, attribName, index);
            tmp_node.prop = propName;
            /*Look for pattern created during preProcessRepeatNode() to indicate this node is an
              embedded interpolation node inside a repeat; however the model and/or attrib behind
              the node differ from that of the repeat*/
            if(!_.isNullOrEmpty(propName) && propName.indexOf('zTMPzDOT') != _.UNINDEXED){
              repeatAnnotationParts = propName.split('DOT');
              tmp_node.repeatModelName = repeatAnnotationParts[1];
              tmp_node.repeatAttribName = repeatAnnotationParts[2]; 
              tmp_node.repeatIndex = index;
              tmp_node.index = _.UNINDEXED;
              tmp_node.prop = '';
            }
            
            tmp_node.scope = scope;
            splitNode = DOM.splitText(DOM_Node, partMap[x]['start'] - prevLength)
            //splitNode = DOM_Node.splitText(partMap[x]['start'] - prevLength);
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
            
            if(DOM_Node.nodeType != _.TEXT_NODE)
                break;
            splitNode = DOM.splitText(DOM_Node, partMap[x]['end']  - prevLength);
            //splitNode = DOM_Node.splitText(partMap[x]['end']  - prevLength);
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

            if(DOM_Node.nodeType != _.TEXT_NODE)
                break;
              
          }
          partMap.length = 0;
          prevLength = 0;
        }else if(DOM_Node.nodeType == _.ELEMENT_NODE){
          /* TODO: Move to 'Component' Class
            Initial component replacement*/
          var componentName = DOM_Node.tagName.toLowerCase(),
              component = Templar._components[componentName],
              DOM_component = null,
              TMP_processed_components = null,
              attribVal,
              templateContent,
              matches = null;
          if(_.isDef(component)
              && !_.isNullOrEmpty(component.templateContent)
              && !_.isNull(DOM_Node.parentNode)){
            _.log('Is Defined Component: ' + DOM_Node.tagName);
            
            /*Transclude content*/
            if(component.transclude == true){
              templateContent = component.templateContent.replace('<content></content>', DOM_Node.innerHTML);
            }
            DOM_Node.insertAdjacentHTML('afterend', templateContent);
            DOM_component = DOM_Node.nextElementSibling;
            DOM_component.tmp_component = component;
            /*probably unecessary*/
            DOM.cloneAttributes(DOM_Node, DOM_component);
            
            var origSetAttrib = DOM_component.setAttribute;
            DOM_component.setAttribute = function(name, val){
              var component = this.tmp_component,
                  updateFunc;

              if(_.isFunc(updateFunc = component.attributes[name])){
                updateFunc.call(null, this, val);
              }
              
              origSetAttrib.call(this,name, val);
            };
            
            /*Iniatialization of component attrib values happen in preProcessNodeAttributes(),
              which calls Interpolate.updateNodeAttributes() where the magic actually happens*/
            TMP_processed_components = Process.preProcessNodeAttributes(DOM_component, scope);
            /*Strange lesson here. The iter variable was named 'i'. This 'i' was clobbering
            the value of the main loop's 'i' and 'sending the main loop back in time'. */
            for(var z = 0; z < TMP_processed_components.length; z++){
              TMP_processed_components[z].isComponent = true;
              TMP_processed_components[z].componentName = componentName;
            }
            
            
            /*Initalization of custom attributes*/

            for(attrib in component.attributes){
              if(!_.isNullOrEmpty(attribVal = DOM_Node.getAttribute(attrib))){
                component.attributes[attrib].call(null, DOM_component, attribVal);
              }
            }
            DOM_Node.parentNode.removeChild(DOM_Node);
            DOM_Node = null;
          }
          //log('Recursing on :' + DOM_Node.tagName);
          var repeatKey = DOM.getDataAttribute(DOM_Node, _.IE_MODEL_REPEAT_KEY);
          if(!_.isNullOrEmpty(repeatKey)){
            modelNameParts = Process.parseModelAttribName(repeatKey);
            modelName = modelNameParts[0];
            attribName = modelNameParts[1];
          }
          /*Annotate Control Node*/
          /*DOM_Node control value is annotated with model, attrib, and index data that is used to id and delete
            during preprocessing. Once we reach that node during recursive compiling, we create a ControlNode
            using the annotated data and add it to our control list*/
          compileMe = Process.preProcessNode(DOM_Node, modelName, attribName, scope);
          var controlKey = DOM.getDataAttribute(DOM_Node, _.IE_CTRL_ATTRIB_KEY)
           //1 = ctrl name, 3 = mdlName, 4 = attribName, 6 = index 
          if(!_.isNullOrEmpty(controlKey)
            && (ctrlRegexResult = /(\w+)(\|(\w+)\.(\w+)(\.(\d+))*)*/g.exec(controlKey)) !== null){
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


});