function Query(type){
  if(!(typeof this != Query))
    return new Query();
  this.type = (typeof type !== 'undefined') ? type : 'SELECT'; 
  this.conditions = [];
}

Query.prototype = {
  statement : {
    action : '',
    data : {},
    conditions : {}
  },
  
  condition : function(Condition, op){
      this.conditions.push({prepositons : Condition.prepositions, inter : 'AND'});
  },
  limit : function(limit){},
  limitOffset : function(offset){},
  buildStatement : function(){
    this.statement.action = this.type;
    for(var i = 0; i < this.conditions.length; i++){
      
      
    }
  },
  execute : function(){
    this.statement = this.buildStatement();
    //do ajax
  }
    
  };

function Select(){Query.call(this, 'SELECT');}
function DistinctSelect(){Query.call(this, 'SELECT');}
function Delete(){Query.call(this, 'DELETE');}
function Insert(){Query.call(this, 'Insert');}
function Update(){Query.call(this, 'UPDATE');}

Select.prototype = Object.create(Query.prototype);
DistinctSelect.prototype = Object.create(Query.prototype);
Delete.prototype = Object.create(Query.prototype);
Insert.prototype = Object.create(Query.prototype);
Update.prototype = Object.create(Query.prototype);

function Condition(column, value, compOp){
  if(!(this instanceof Condition))
    return new Condition(column, value, compOp);
  this.preposition = { _op_ : compOp, _prep_ : 'AND', length : 1};
  this.preposition[column] = value;
  this.prepositions = [this.preposition];

}

Condition.prototype = {
  toString : function(){
    return this.prepositions;
  },
  extend : function(from, to){
    var added = 0;
    for(var k in from){
      if(from.hasOwnProperty(k) && typeof to[k] == 'undefined'){
        to[k] = from[k];
        added++;
      }
    }
    return added;
  },
  addPrep : function(preposition, prep){
    var lastPrep, keys;
    lastPrep = this.prepositions.pop();
    if(lastPrep == null) return;

    /*detects a binary preposition and allows for setting and/or*/
    if(lastPrep.length == 1 && preposition.length == 1 
      && lastPrep._op_ == preposition._op_){    
      lastPrep.length += this.extend(preposition, lastPrep);
      lastPrep._prep_ = prep;
      this.prepositions.push(lastPrep);
    }else /*extends current proposition*/
    if(lastPrep._prep_ == prep && lastPrep._op_ == preposition._op_){
      lastPrep.length += this.extend(preposition, lastPrep);
      this.prepositions.push(lastPrep);
    }else /*pushes new proposition, set interprop logic*/
    if(lastPrep._prep_ != prep || lastPrep._op_ != preposition._op_){
      lastPrep._interPrep_ = prep;
      this.prepositions.push(lastPrep);
      this.prepositions.push(preposition);
    }

  },
  
  build : function(Condition, prep){
    /*check if compound condition*/
    for(var i = 0; i < Condition.prepositions.length; i++){
      if(i == 0)
        this.addPrep(Condition.prepositions[i], prep);
      else
        this.prepositions.push(Condition.prepositions[i]);
    }
    
  },
  
  and : function(Condition){
    this.build(Condition, 'AND');
    return this;
  },
  
  or : function(Condition){
    this.build(Condition, 'OR');
    return this;
  }
}

function EQ(){};function GTE(){};function GT(){};function LT(){};
function LTE(){};function NE(){};function LIKE(){};

EQ.prototype = Object.create(Condition.prototype);
GTE.prototype = Object.create(Condition.prototype);
GT.prototype = Object.create(Condition.prototype);
LT.prototype = Object.create(Condition.prototype);
LTE.prototype = Object.create(Condition.prototype);
NE.prototype = Object.create(Condition.prototype);
LIKE.prototype = Object.create(Condition.prototype);

function EQ(column, value){return Condition.call(this, column, value, 'EQ' );}
function GTE(column, value){return Condition.call(this, column, value, 'GTE' );}
function GT(column, value){return Condition.call(this, column, value, 'GT' );}
function LT(column, value){return Condition.call(this, column, value, 'LT' );}
function LTE(column, value){return Condition.call(this, column, value, 'LTE' );}
function NE(column, value){return Condition.call(this, column, value, 'NE' );}
function LIKE(column, value){return Condition.call(this, column, value, 'LIKE' );}

//var sq = new Select();
var c = EQ('sup',45).and( NE('a', 0).and(LIKE('b', 8)))
  /*,
   c2 = EQ('blah',7),
   c3 = LT('sup', 45);*/
var condition = LT('ad_id',20).or(c);//.and( EQ('uid',18) );
console.log(condition);
/*sq.condition( LT('ad_id',20).and( EQ('uid',18) ) );
sq.and( GTE('ad_id',20) );
sq.execute(function(res){
  //do stuff with rs
});
*/

