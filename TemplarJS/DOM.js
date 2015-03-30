structureJS.module('DOM', function(require){

var Circular = structureJS.circular()
    _  = this;

return {
  modifyClasses : function(node, add, remove){
    var nodeClassList = '',
        removeAsArray = remove.split(_.CLASS_SEPARATOR);
    
    if(!_.isNull(node)){
      /*getAttribute may return '' or null so we check below*/
      nodeClassList = node.getAttribute('class');
      nodeClassList = (_.isNull(nodeClassList)) ? '' : nodeClassList.trim();
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
      idListAsArray = commaSeparatedIdList.split(_.CLASS_SEPARATOR);
      for(var i = 0; i < idListAsArray.length; i++){
        nodeToHide = document.getElementById(idListAsArray[i]);
        this.modifyClasses(nodeToHide,'apl-hide','apl-show,apl-hide');
        
      }
    }
  },
  appendTo : function(child, parent){  
    if(!_.isDef(parent) || !_.isDef(child) || _.isNull(parent.parentNode))
      return;
    parent.parentNode.insertBefore(child, child.nextSibling);
  },
  
  cloneAttributes : function(fromNode, toNode, noClobber){
    var noClobber = (!_.isDef(noClobber)) ? false : true,
        toNodeAttrib;
    if(fromNode.hasAttributes()){
      attributes = fromNode.attributes;
      /*search node attributes for non-terminals*/
      for(var i = 0; i < attributes.length; i++){
        if(attributes[i].name == 'data-apl-repeat' || attributes[i].name == 'style')
          continue;
          
        if(noClobber == false){
          toNode.setAttribute(attributes[i].name, attributes[i].value);
        }else{
          toNodeAttrib = (_.isNullOrEmpty(toNodeAttrib = toNode.getAttribute(attributes[i].name))) 
                            ? '' : toNodeAttrib + ' ';
          toNode.setAttribute(attributes[i].name, toNodeAttrib + attributes[i].value);
        }
        
      }

    }
  },
  
  isVisible : function(DOM_node){
    if(_.isNull(DOM_node))
      return false;
    
    return (DOM_node.offsetWidth > 0 || DOM_node.offsetHeight > 0);
  },
  
  asynGetPartial : function(fileName, callback, targetId, node){
    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.fileName = fileName;
    xhr.targetId = targetId;
    xhr.targetNode = node;
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4){   //if complete
        if(xhr.status !== 200){  //check if "OK" (200)
          _.log('WARNING(404): FILE "'+xhr.fileName+'" NOT FOUND');
        }
      } 
    }
    if(!_.isNullOrEmpty(xhr.fileName)){
      xhr.open('get',  fileName, true);
      xhr.send();
    }
    
  },
  
  asynFetchRoutes : function(routeObj, onComplete){
    var currFile = '',
        routes = [],
        routeName = routeObj.route;
        routes.onComplete = onComplete || function(){};
    
    function deferenceRoutes(inArr, outArr){
      var routeName = null,//route1
          routeObj = '',
          /*by value b/c we need the partial array for subsequent calls to 
            DOM.asynFetchRoutes(). We can't consume it so we use the value.*/
          inArr = inArr.slice(0),
          isRoute,
          isString;
      while((routeName = inArr.shift()) != null){
      
        if((isString = _.isString(routeName)) && (isRoute = Circular('Route').isRoute(routeName))){
          routeObj = Circular('Route').getRouteObj(routeName);
          if(_.isArray(routeObj.partial)){
            deferenceRoutes(routeObj.partial, outArr);
          }else{
            outArr.push(routeObj);
          }
        }else if(!isString){
          outArr.push(routeName);
        }
        /*noop if routeName was a string but didn't match a route*/
      }
      
    }
    
    function getFileContents(routes){
      var xhr = new XMLHttpRequest(),
          routeObj = null;
      
      if((routeObj = routes.shift()) != null){
        xhr.onload = Circular('Bootstrap').loadPartialIntoTemplate;
        xhr.fileName = routeObj.partial;
        xhr.targetId = routeObj.target;
        xhr.route = routeObj.route;
        xhr.fallback = routeObj.fallback || '';
        xhr.callbackOnComplete = routes.onComplete || function(){},
        /*We copy the route array b/c the next xhr call will alter the reference
          and will blow up the length check we use to determine when to call
          onComplete*/
        xhr.callbackParam1 = routes.slice(0);
        /*the context is the previously loaded route. All properties of 'this' are
        'looking back' at the last route that was loaded.*/
        xhr.callback = function(){
          State.onloadFileQueue.push(this.fileName);
          getFileContents.call(null, this.callbackParam1);
          if(this.callbackParam1.length == 0){
            Circular('Bootstrap').fireOnloads();
            this.callbackOnComplete.call(null);
          }
        }
        
        xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){   //if complete
            if(xhr.status === 404){  //check if "OK" (200)
              _.log('WARNING(404): FILE "'+xhr.fileName+'" NOT FOUND');
              if(!_.isNullOrEmpty(xhr.fallback)){
                _.log('WARNING (404): ATTEMPTING FALLBACK ROUTE "'+xhr.fallback+'".');
                Circular('Route').open(xhr.fallback);
              }
            }
          } 
        }
        if(!_.isNullOrEmpty(xhr.fileName)){
          xhr.open('get',  xhr.fileName, true);
          xhr.send();
        }
      }
      
    }
    
    if(_.isArray(routeObj.partial)){
      deferenceRoutes(routeObj.partial, routes);
    }else{
      routes.push(routeObj);
    }
    
    State.onloadFileQueue.push(routeName);
    getFileContents(routes);
  },
  
  /*Solution from: http://stackoverflow.com/questions/7378186/ie9-childnodes-not-updated-after-splittext*/
  insertAfter : function(node, precedingNode) {
    var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
    if (nextNode) {
      parent.insertBefore(node, nextNode);
    } else {
      parent.appendChild(node);
    }
    return node;
  },

// Note that we cannot use splitText() because it is bugridden in IE 9.
  splitText : function(node, index) {
    var newNode = node.cloneNode(false);
    newNode.deleteData(0, index);
    node.deleteData(index, node.length - index);
    this.insertAfter(newNode, node);
    return newNode;
  },
  
  getHashValue : function(url){
    return (_.isString(url)) ? url.substring(url.indexOf('#')).replace('#', '') : '';
  },
  
  getDataAttribute : function(DOM_Node, attributeKey){
    var parts = (_.isString(attributeKey)) ? attributeKey.split('-') : [];
    var value = null;
    /*camelcase from the first word on*/
    var camelCaseKey = parts.slice(0,1).concat(parts.slice(1).map(function(part){
      return part.charAt(0).toUpperCase() + part.slice(1);
    })).join('');
    
    if(!_.isNull(DOM_Node)){
      if(_.isDef(DOM_Node.dataset)){
        value = DOM_Node.dataset[camelCaseKey];
      }else{
        value = DOM_Node.getAttribute('data-' + attributeKey);
      }
    }

    return (_.isNull(value)) ? '' : value;
  },
  
  annotateDOMNode : function(DOM_Node, modelName, attribName, token){
    DOM_Node[_.DOM_MDL_NAME] = modelName || '';
    DOM_Node[_.DOM_ATTR_NAME] = attribName || '';
    DOM_Node[_.DOM_TOKEN] = token || DOM_Node[_.DOM_TOKEN] || null;
  },
  
  getDOMAnnotations : function(DOM_Node){
    return { 
            modelName : DOM_Node[_.DOM_MDL_NAME],
            attribName : DOM_Node[_.DOM_ATTR_NAME],
            token : DOM_Node[_.DOM_TOKEN]
            };
  }
  
}; 


});