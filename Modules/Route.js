/*Non signature-based*/

function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}
function _isNull(a){return (a === null);}
function RouteNode(value, type, next){
    if(!(this instanceof RouteNode))
        return new RouteNode(value, next);
    this.value = _isDef(value) ? value : null;
    this.next = _isDef(next) ? next : null;
    this.type = _isDef(type) ? type : null;
    this.signature = '';
    this.partial = '';
    this.length = 0;
    this.route = '';
}

var NON_TERMINAL = 0;
var TERMINAL = 1;
var NT_REGEX = /\w\:\w/;
function buildRouteLinkedList(route, partial){
  var next = null,
      parent = new RouteNode(),
      lastNode = parent,
      thisNode = parent,
      partial = (_isDef(partial)) ? partial : '',
      parts = route.trim().split('/').slice(1);

  for(var i = 0; i < parts.length; i++){

    thisNode  = new RouteNode(parts[i], !NT_REGEX.test(parts[i]));
    
    lastNode = lastNode.next = thisNode;
  }
  parent = parent.next;
  parent.partial = partial;
  parent.route = route;

  return parent;

}
/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
  var routeObj = Object.create(null);
  var ambiguityTree = Object.create(null);
  var normalizedName = null;
  var routePartName = '';
  var tmp = null;
  var tat = null;
  var routeNode = null;
  var rootNode = null;
  var terminalBranchCreated = false;
  var nonAmbiguousBranchCreated = false;
  var lookahead = null;
  var route = '';

  for(var i = 0; i < routes.length; i++){
    routeNode = buildRouteLinkedList(routes[i].route, routes[i].partial);
            
    tmp = routeObj;
    tat = ambiguityTree;
    rootNode = routeNode;
    do{
      
      routePartName = routeNode.value.toLowerCase();
      /*Basically we flatten the tree by normalizing NT names*/
      normalizedName = (NT_REGEX.test(routeNode.value)) ? 'NT' : routePartName;
      
      if(!_isDef(tmp[routePartName])){
        tmp[routePartName] = Object.create(null);
        tmp[routePartName].lookaheadType = routeNode.type;
        tmp[routePartName].endOfChain = false;
        terminalBranchCreated = true; 
      }
      /*Make parallel tree with NT names normalized so they don't spawn branches. */
      if(!_isDef(tat[normalizedName])){
        tat[normalizedName] = Object.create(null);
        nonAmbiguousBranchCreated = true;
      }
      
      /*if im the last element, I && my lookaheadType with itself keeping it the same*/
      lookahead = (!_isNull(routeNode.next)) ? routeNode.next.type : tmp[routePartName].lookaheadType;
      /*if next part is NT, NT becomes my lookaheadType*/
      tmp[routePartName].lookaheadType = tmp[routePartName].lookaheadType && lookahead; 
      /*if NT is next part, store it's pattern as my lookaheadKey*/
      if(!_isNull(routeNode.next) 
        && tmp[routePartName].lookaheadType == NON_TERMINAL
        && routeNode.next.type == NON_TERMINAL){
        tmp[routePartName].lookaheadKey = routeNode.next.value.toLowerCase();
      }
      
      tmp = tmp[routePartName];
      tat = tat[normalizedName];
      
      route = rootNode.route;
      routeNode = routeNode.next;
                   
    }while(routeNode != null);
    
    /*we can get away with not creatin a new branch if pattern before us has same pattern but longer*/
    if(!terminalBranchCreated && tmp.endOfChain == true){
      throw 'Error: Duplicate Route "' + routes[i].route + '" Detected';
    }

    if(!nonAmbiguousBranchCreated && tmp.endOfChain == true){
      throw 'Error: Ambiguous Route "' + routes[i].route + '" Detected';
    }
    
    tmp.endOfChain = true;
    tmp.route = route;
    terminalBranchCreated = false;
    nonAmbiguousBranchCreated = false;
  }
  _log(routeObj);
  return routeObj;
}

function resolveRoute(route, routeTree){
  var parts = route.trim().split('/').slice(1),
      nonTerminalValues = [],
      key = '',
      skipKeyAssignment = false;
  
  routePart = routeTree;
 
  for(var i = 0; i < parts.length; i++){
  
    if(skipKeyAssignment){
      skipKeyAssignment = !skipKeyAssignment;
    }else{
      key = parts[i].toLowerCase();
    }
    
    routePart = routePart[key];
    
    if(!_isDef(routePart))
      throw 'Error: Route "' + route + '" not found';
      
    /*take non-term paths first, if not there check lookaheads and take that path*/
    if(i + 1 < parts.length && !_isDef(routePart[parts[i+1]]) && routePart.lookaheadType == NON_TERMINAL){
      key = routePart.lookaheadKey;
      nonTerminalValues.push([key, parts[i+1]]);
      skipKeyAssignment = true;
    }
  }
  
  if(routePart.endOfChain == true)
    _log('Route matched: ' + route + ' with ' + routePart.route);
  else
    throw ' > Route "' + route + '" not found';
    
  _log(routePart);
  _log(nonTerminalValues);
}

(function(){
  var routes =    [{route : '/term2/z'}, {route : '/term2/w:e/z'}, {route : '/term2/z/w:q'}, 
                   {route : '/term2/z/m'}];
  var nonMatch = '/TERM2/z/dookie';
  var routeTree = buildRouteTree(routes);
  resolveRoute(nonMatch, routeTree);
})();
