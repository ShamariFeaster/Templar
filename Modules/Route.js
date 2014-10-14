/*Non signature-based*/

function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}
function _isNull(a){return (a === null);}

var NON_TERMINAL = 0;
var TERMINAL = 1;
var NT_REGEX = /\w\:\w/;

/*must remove trailing slashes, and enforce leading slashes*/
function buildRouteTree(routes){
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

    parts = routes[i].route.trim().split('/').slice(1); 
    tmp = routeObj;
    tat = ambiguityTree;
    
    for(var x = 0; x < parts.length; x++){
      routePartName = parts[x].toLowerCase();
      thisType = (NT_REGEX.test(parts[x])) ? NON_TERMINAL : TERMINAL;
      nextPart = (x+1 < parts.length) ? parts[x+1] : null;
      nextType = (!_isNull(nextPart)) ? 
        (NT_REGEX.test(nextPart)) ? NON_TERMINAL : TERMINAL : null;
        
      /*Basically we flatten the tree by normalizing NT names*/
      normalizedName = (NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
      
      if(!_isDef(tmp[routePartName])){
        tmp[routePartName] = Object.create(null);
        tmp[routePartName].lookaheadType = thisType;
        tmp[routePartName].endOfChain = false;
        terminalBranchCreated = true; 
      }
      /*Make parallel tree with NT names normalized so they don't spawn branches. */
      if(!_isDef(tat[normalizedName])){
        tat[normalizedName] = Object.create(null);
        nonAmbiguousBranchCreated = true;
      }
      
      /*if im the last element, I && my lookaheadType with itself keeping it the same*/
      lookahead = (!_isNull(nextPart)) ? nextType : tmp[routePartName].lookaheadType;
      /*if next part is NT, NT becomes my lookaheadType*/
      tmp[routePartName].lookaheadType = tmp[routePartName].lookaheadType && lookahead; 
      /*if NT is next part, store it's pattern as my lookaheadKey*/
      if(!_isNull(nextPart) 
        && tmp[routePartName].lookaheadType == NON_TERMINAL
        && nextType == NON_TERMINAL){
        tmp[routePartName].lookaheadKey = nextPart.toLowerCase();
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
  var nonMatch = '/TERM2/z';
  var routeTree = buildRouteTree(routes);
  resolveRoute(nonMatch, routeTree);
})();
