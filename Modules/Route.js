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

function buildRouteLinkedList(route, partial){
  var next = null,
      ntRegex = /\w\:\w/,
      parent = new RouteNode(),
      lastNode = parent,
      thisNode = parent,
      partial = (_isDef(partial)) ? partial : '',
      parts = route.trim().split('/').slice(1);

  for(var i = 0; i < parts.length; i++){

    thisNode  = new RouteNode(parts[i], !ntRegex.test(parts[i]));
    
    lastNode = lastNode.next = thisNode;
  }
  parent = parent.next;
  parent.partial = partial;
  parent.route = route;

  return parent;

}
/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
  var routeObj = {};
  var tmp = null;
  var routeNode = null;
  var parent = null;
  var branchCreated = false;
  var lookahead = null;

  for(var i = 0; i < routes.length; i++){
    routeNode = buildRouteLinkedList(routes[i].route, routes[i].partial);
            
    tmp = routeObj;
    parent = routeNode;
    do{
      delete tmp.parent;

      if(!_isDef(tmp[routeNode.value])){
        tmp[routeNode.value] = Object.create(null);
        tmp[routeNode.value].lookaheadType = routeNode.type;
        tmp[routeNode.value].endOfChain = false;
        branchCreated = true;
      }
      
      lookahead = (!_isNull(routeNode.next)) ? routeNode.next.type : tmp[routeNode.value].lookaheadType;
      tmp[routeNode.value].lookaheadType = tmp[routeNode.value].lookaheadType && lookahead; 
      
      if(!_isNull(routeNode.next) 
        && tmp[routeNode.value].lookaheadType == NON_TERMINAL
        && routeNode.next.type == NON_TERMINAL){
        tmp[routeNode.value].lookaheadKey = routeNode.next.value;
      }
        
      tmp = tmp[routeNode.value];
      
      tmp.parent = parent;
      routeNode = routeNode.next;
                   
    }while(routeNode != null);
    
    if(!branchCreated && tmp.endOfChain == true){
      throw 'Error: Ambiguous Route "' + routes[i].route + '"';
    }
    tmp.endOfChain = true;
    branchCreated = false;
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
      key = parts[i];
    }
    
    routePart = routePart[key];
    
    if(!_isDef(routePart))
      throw 'Error: Route "' + route + '" not found';
      
    /*take non-term paths first, if not there check lookaheads and take that path*/
    if(i + 1 < parts.length && !_isDef(routePart[parts[i+1]]) && routePart.lookaheadType == NON_TERMINAL){
      key = routePart.lookaheadKey;
      nonTerminalValues.push(parts[i+1]);
      skipKeyAssignment = true;
    }
  }
  if(routePart.endOfChain == true)
    _log('Route matched: ' + route);
  else
    throw ' > Route "' + route + '" not found';
    
  _log(routePart);
  _log(nonTerminalValues);
}
/*
var routes = [{route : '/term1/non:term1/term2', partial : 'partial1.html'}, 
          {route : '/term1',  partial : 'partial1.html'}, 
           {route : '/term2/non:term1/term3'},
          {route : '/term2/term3/non:term2', partial : 'partial3.html'}];
*/

(function(){
  var routes =    [{route : '/term2/term6/a:b/f:D'}, {route : '/term2/term6'}];
  var nonMatch = '/term2/term6';
  var routeTree = buildRouteTree(routes);
  resolveRoute(nonMatch, routeTree);
})();
