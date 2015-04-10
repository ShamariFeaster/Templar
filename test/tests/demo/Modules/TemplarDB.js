function Query(type){
  if(!(typeof this != Query))
    return new Query();
  this.type = (_.isDef(type)) ? type : 'SELECT';
  this.statement; 
  this.conditions = [];
}

Query.prototype = {
  condition : function(prepositons, op){
      this.conditions.push({prepositons : prepositions, inter : 'AND'});
  },
  and : function(prepositons){
    this.condition(prepositons, 'AND');
  },
  or : function(prepositons){
    this.condition(prepositons, 'OR');
  },
  buildStatement : function(){
  
  },
  execute : function(){
    this.statement = this.buildStatement();
    //do ajax
  }
    
  };

function Select(){
  Query.call(this, 'SELECT');
}
function Delete(){
  Query.call(this, 'DELETE');
}
function Insert(){
  Query.call(this, 'Insert');
}
function Update(){
  Query.call(this, 'UPDATE');
}

Select.prototype = Object.create(Query.prototype);
Delete.prototype = Object.create(Query.prototype);
Insert.prototype = Object.create(Query.prototype);
Update.prototype = Object.create(Query.prototype);

function Condition(column, value){
  if(!(this instanceof Condition))
    return new Condition(column, value);
    
  this.prepositions = [];
}

Condition.prototype = {
    and : function(condition){
        this.prepositons.push( {condition : condition, intra : 'AND'});
    },
    or : function(){
      this.prepositons.push( {condition : condition, intra : 'OR'} );
    }
}

EQ.prototype = Object.create(Condition.prototype);
GTE.prototype = Object.create(Condition.prototype);
GT.prototype = Object.create(Condition.prototype);
LT.prototype = Object.create(Condition.prototype);
LTE.prototype = Object.create(Condition.prototype);
NE.prototype = Object.create(Condition.prototype);
LIKE.prototype = Object.create(Condition.prototype);

function EQ(column, value){
  Condition.call(this, column, value );
}
function GTE(column, value){
  Condition.call(this, column, value );
}
function GT(column, value){
  Condition.call(this, column, value );
}
function LT(column, value){
  Condition.call(this, column, value );
}
function LTE(column, value){
  Condition.call(this, column, value );
}
function NE(column, value){
  Condition.call(this, column, value );
}
function LIKE(column, value){
  Condition.call(this, column, value );
}

var sq = new Select();
sq.condition( LT('ad_id',20).and( EQ('uid',18) ) );
sq.and( GTE('ad_id',20) );
sq.execute(function(res){
  //do stuff with rs
});

