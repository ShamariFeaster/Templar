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
  and : function(Condition){
    this.condition(Condition, 'AND');
  },
  or : function(Condition){
    this.condition(Condition, 'OR');
  },
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

function Condition(column, value, compOp){
  if(!(this instanceof Condition))
    return new Condition(column, value, compOp);
  this.column = column;
  this.value = value;
  this.compOp = compOp;
  this.prep = 'AND';
  this.preposition = { _op_ : compOp, _prep_ : 'AND'};
  this.preposition[column] = value;
  this.prepositions = [this.preposition];
}

Condition.prototype = {
  addPrep : function(Condition, prep){
    var lastPrep = this.prepositions.pop();
    if(lastPrep == null) return;
    /*one prep on chain, override intra-prep*/
    if(this.prepositions.length == 0 && lastPrep.compOp == Condition.compOp){
      lastPrep[Condition.column] = Condition.value;
      lastPrep._prep_ = prep;
      this.prepositions.push(lastPrep);
    }else
    if(this.prepositions.length > 0 && lastPrep._prep_ == prep && lastPrep.compOp == Condition.compOp){
      lastPrep[Condition.column] = Condition.value;
      this.prepositions.push(lastPrep);
    }else 
    if(this.prepositions.length > 0 && (lastPrep._prep_ != prep || lastPrep.compOp != Condition.compOp)){
      lastPrep._interPrep_ = prep;
      this.prepositions.push(lastPrep);
      this.prepositions.push(Condition.preposition);
    }
  },
  
  build : function(Condition, prep){
    /*check if compound condition*/
    if(Condition.prepositions.length == 1){
      this.addPrep(Condition, prep);
    }else{
      var lastPrep = this.prepositions.pop();
      lastPrep._prep_ = prep;
      this.prepositions.push(lastPrep);
      this.prepositions.concat(Condition.prepositions);
    }
    
  },
  
  and : function(Condition){
    this.build(Condition, 'AND');
  },
  
  or : function(Condition){
    this.build(Condition, 'OR');
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

var sq = new Select();
LT('ad_id',20);//.and( EQ('uid',18) );
/*sq.condition( LT('ad_id',20).and( EQ('uid',18) ) );
sq.and( GTE('ad_id',20) );
sq.execute(function(res){
  //do stuff with rs
});
*/

