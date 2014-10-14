structureJS.module('EnvironmentController', function(require){
  var Templar = require('Templar'),
      EnvModel = Templar.getModel('Environment');
      var dateObj = new Date();
      
      /*Set inital time*/
     // EnvModel.time = dateObj.toDateString() + ' ' + dateObj.toTimeString();
      
      /*Incremenet clock every second
      setInterval(function(){
        dateObj.setSeconds(dateObj.getSeconds() + 1);
        //EnvModel.time = dateObj.toDateString() + ' ' + dateObj.toTimeString();
      },1000);
      */
  
  return {};
});


/*


Templar.Route([
{
//pure alias
  pattern : '/login',
  partial : 'partial-login-screen.html'
},
{
//pure alias
  pattern : '/single',
  partial : 'single-nitework-screen.html'
},
{
//set data, recompilation and re-interp
  pattern : '/login/banner/Login:banner',
  partial : 'partial-login-screen.html'
},
//set data, no recompilation, just re-interp
{
  pattern : '/phones/id/Login:id'
}

]);

ProductModel.filter('phones')
.using('searchInput')
.and(function(searchInput){ return searchInput.length > 2});

ProductModel.listen('orderBy', function(selectChange){
  ProductModel.sort('phones').orderBy(selectChange.value);
  ProductModel.update('phones');
});


Search: <input value="{{Products.searchInput}}">

Sort by:
<select >{{Products.orderBy}}</select>

<ul class="phones">
  <li data-apl-repeat="{{Products.phones}}" class="thumbnail">
    <a href="#/phones/{{id}}" class="thumb"><img data-apl-src="{{imageUrl}}"></a>
    <a href="#/phones/{{id}}">{{name}}</a>
    <p>{{snippet}}</p>
  </li>
</ul>

function RouteNode(value, next, type){
    if(!(this instanceof RouteNode))
        return new RouteNode(value, next);
    this.value = value;
    this.next = next;
    this.type = type;
}
function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}

var route = '/term1/non:term1/term2';
var routeParts = route.split('/');
var routeMap = Object.create(null);
var NON_TERMINAL = 0;
var TERMINAL = 1;

function mapPattern(parts){
    var ntRegex = /\w\:\w/,
        mappedVal = '';
    for(var i = parts.length - 1; i > -1; i--){
        if(parts[i] == '') continue;
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
    }
    return mappedVal;
}

function addRoute(tree, parts, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        nodes = [];
    for(var i = parts.length - 1; i > -1; i--){
        if(parts[i] == '') continue;
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
        next = new RouteNode(parts[i], next, mappedVal.charAt((parts.length - 1) - i));
        nodes.push(next);
    }
    if(!_isDef(tree[mappedVal])){
        tree[mappedVal] = Object.create(null);
    }
    
    var obj = tree[mappedVal];

    for(var i = nodes.length - 1; i > -1; i--){      
        obj[nodes[i].value] = (!_isDef(obj[nodes[i].value])) ?
                                Object.create(null) : obj[nodes[i].value];
        obj = obj[nodes[i].value];
        if(nodes[i].next == null) break;
    }
    
    obj['partial'] = (_isDef(partial)) ? partial : null;
    return tree;
}

routes = [{route : '/term1/non:term1/term2', partial : 'partial1.html'}, 
          {route : '/term1',  partial : 'partial1.html'}, 
           {route : '/term2/term2/non:term1'},
          {route : '/term2/term2/non:term2', partial : 'partial3.html'}];
var routeObj = {};
for(var i = 0; i < routes.length; i++){
    addRoute(routeObj, routes[i].route.split('/'), routes[i].partial);
}
_log(routeObj)    ;
//_log(mapPattern(routeParts));
//_log(addRoute({}, routeParts,'partial.html'));




Linked List Solution

function _isDef(a){return (typeof a !== 'undefined');}
function _log(a){console.log(a);}

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


var route = '/term1/non:term1/term2';
var routeParts = route.split('/');
var routeMap = Object.create(null);
var NON_TERMINAL = 0;
var TERMINAL = 1;

function mapPattern(route){
    var ntRegex = /\w\:\w/,
        mappedVal = '',
        parts = route.split('/').slice(1),
        retVal = Object.create(null);
    for(var i = parts.length - 1; i > -1; i--){
        if(parts[i] == '') continue;
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
    }
    retVal.map = mappedVal;
    retVal.parts = parts;
    return retVal;
}

function buildRouteLinkedList(route, partial){
    var next = null,
        ntRegex = /\w\:\w/,
        mappedVal ='',
        parent = new RouteNode(),
        lastNode = parent,
        thisNode = parent,
        partial = (_isDef(partial)) ? partial : '',
        parts = route.split('/').slice(1);

    for(var i = 0; i < parts.length; i++){
        mappedVal += (ntRegex.test(parts[i])) ? NON_TERMINAL : TERMINAL;
        thisNode  = new RouteNode(parts[i], mappedVal.charAt(i));
        lastNode = lastNode.next = thisNode;
    }
    parent = parent.next;
    parent.signature = mappedVal;
    parent.partial = partial;
    parent.length = parts.length;
    parent.route = route;
   return parent;

}

function buildRouteTree(routes){
    var routeObj = {};
    var tmp = null;
    var routeNode = null;
    var parent = null;
    var branchCreated = false;
    for(var i = 0; i < routes.length; i++){
        routeNode = buildRouteLinkedList(routes[i].route, routes[i].partial);
        
        if(!_isDef(routeObj[routeNode.signature])){
            routeObj[routeNode.signature] = Object.create(null);
        }
        
        tmp = routeObj[routeNode.signature];
        parent = routeNode;
        do{
            delete tmp.parent;
            
            if(routeNode.type == TERMINAL){
                
                if(!_isDef(tmp[routeNode.value])){
                    tmp[routeNode.value] = Object.create(null);
                    branchCreated = true;
                }else{
                    tmp[routeNode.value] = tmp[routeNode.value];
                }

                tmp = tmp[routeNode.value];
            }
            
            tmp.parent = parent;
            routeNode = routeNode.next;        
        }while(routeNode != null)
            if(!branchCreated){
                throw 'Error: Ambiguous Route "' + routes[i].route + '"';
            }
        branchCreated = false;
    }
    return routeObj;
}

function resolveRoute(route, routeTree){
    var routeObj = mapPattern(route),
        routePart = routeTree[routeObj.map];
    if(!_isDef(routePart))
        throw 'Error: Route "' + route + '" not found';
    
    for(var i = 0; i < routeObj.parts.length; i++){
        if(routeObj.map.charAt(i) == NON_TERMINAL) continue;
        routePart = routePart[routeObj.parts[i]];
        if(!_isDef(routePart))
            throw 'Error: Route "' + route + '" not found';
    }
    _log('Route matched: ' + route);
}

var routes = [{route : '/term1/non:term1/term2', partial : 'partial1.html'}, 
          {route : '/term1',  partial : 'partial1.html'}, 
           {route : '/term2/non:term1/term3'},
          {route : '/term2/term3/non:term2', partial : 'partial3.html'}];

var routes =    [{route : '/term2/term3/non:term1'}, {route : '/term2/term5/non:term2'}];
    
var routeTree = buildRouteTree(routes);
resolveRoute(routes[0].route, routeTree);
*/