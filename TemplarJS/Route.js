structureJS.module('Route', function(require){

var _ = this;

return {

  buildRouteLinkedList : function(route, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        parent = new RouteNode(),
        lastNode = parent,
        thisNode = parent,
        partial = (_.isDef(partial)) ? partial : '',
        parts = route.trim().split('/').slice(1),
        nonTerminals = [];

    for(var i = 0; i < parts.length; i++){
      mappedVal += (ntRegex.test(parts[i])) ? _.NON_TERMINAL : _.TERMINAL;
      thisNode  = new RouteNode(parts[i], mappedVal.charAt(i));
      
      if(thisNode.type == _.NON_TERMINAL)
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
      thisType = (_.NT_REGEX.test(parts[x])) ? _.NON_TERMINAL : _.TERMINAL;
      nextPart = (x+1 < parts.length) ? parts[x+1] : null;
      nextType = (!_.isNull(nextPart)) ? 
        (_.NT_REGEX.test(nextPart)) ? _.NON_TERMINAL : _.TERMINAL : null;
        
      /*Basically we flatten the tree by normalizing NT names*/
      normalizedName = (_.NT_REGEX.test(parts[x])) ? 'NT' : routePartName;
      
      if(!_.isDef(tmp[routePartName])){
        tmp[routePartName] = Object.create(null);
        tmp[routePartName].endOfChain = false;
        tmp[routePartName].lookaheadVal = (nextType == _.NON_TERMINAL) ? nextPart : '';
        tmp[routePartName].lookaheadType = nextType;
        terminalBranchCreated = true; 
      }
      /*Make parallel tree with NT names normalized so they don't spawn branches. */
      if(!_.isDef(tat[normalizedName])){
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
  
  _.log(routeObj);
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
          
      if(_.isDef(routePart.lookaheadType) && routePart.lookaheadType == _.NON_TERMINAL){
        key = routePart.lookaheadVal;
      }else{
        key = parts[i].toLowerCase();
      }
      
      routePart = routePart[key];
      
      if(!_.isDef(routePart))
        throw 'Error: Route "' + route + '" not found';

    }
    
    if(routePart.endOfChain == true)
      _.log('Route matched: ' + route + ' with ' + routePart.route);
    else
      throw ' > Route "' + route + '" not found';
      
    _.log(routePart);
    _.log(nonTerminalValues);
    }
  
};


});