<?php

class Statement {
  public static $insertQuery ='INSERT INTO __table__ (__names__) VALUES (__values__)';
  public static $updateQuery ='UPDATE __table__ SET __pair__';
  public static $deleteQuery = 'DELETE FROM __table__';
  public static $selectQuery = 'SELECT __pre__ __columns__ FROM __table__';
  
  private $connection;
  private $actionMap;//could be static
  private $bindParam;//could be static
  private $bindArray;
  
  public function __construct(&$conn ,$action = ''){
    $this->connection = $conn;
    $this->action = $action;
    $this->actionMap = array('insert' => self::$insertQuery,
                             'update' => self::$updateQuery,
                             'delete' => self::$deleteQuery,
                             'select' => self::$selectQuery);
    $this->bindParam = (new ReflectionClass('mysqli_stmt'))->getMethod('bind_param'); 
    
  }
  
  /*------ HELPERS --------*/
  private function prepBindArray(){
    for($i = 0; $i < count($this->bindArray); $i++){
      $this->bindArray[$i] = &$this->bindArray[$i];
    }
  }
  /* this is 1st args to bind_param. we use all strings cause that's how #'s are passed to us */
  private function addToTypedefString($count){
    if(isset($this->bindArray[0])){
      $this->bindArray[0] .= str_repeat('s', $count);
    }else{
      $this->bindArray[0] = str_repeat('s', $count);
    }
    
  }
  
  /*our 'data' param is transformed into assoc array by the EndPoint. We use that array here but
  we need the keys and values separate. We also build the '?'s for the prepared statement*/
  private function parseData($keyValArr){
    $returnObj = new stdClass();
    $returnObj->columns =  array_keys($keyValArr);
    $returnObj->values = array_values($keyValArr);
    $returnObj->cQs = '';
    $returnObj->vQs = '';
    
    if(count($returnObj->columns) > 0){
      $returnObj->cQs = implode(',',array_fill(0, count($returnObj->columns) , '?'));
      $returnObj->vQs = implode(',',array_fill(0, count($returnObj->values) , '?'));
    }
    
    return $returnObj;
  }
  private function getCompOp(&$condition){
    $op = (isset($condition['_op_'])) ? $condition['_op_'] : '';
    
    switch($op){
      case 'EQ': $op = '='; break;
      case 'GTE': $op = '>='; break;
      case 'GT': $op = '>'; break;
      case 'LTE': $op = '<='; break;
      case 'LT': $op = '='; break;
      case 'NE': $op = '!='; break;
      case 'LIKE': $op = 'LIKE'; break;
      default: $op = '='; break;
    }
    unset($condition['_op_']);
    return $op;
  }
  
  private function getLimit(&$condition){
    $limitObj = new stdClass();
    $limitObj->limit = (isset($condition['_limit_'])) ? $condition['_limit_'] : null;
    $limitObj->limitOffset = (isset($condition['_limitOffset_'])) ? $condition['_limitOffset_'] : null;
    unset($condition['_limit_']);
    unset($condition['_limitOffset_']);
    return $limitObj;
  }
  
  /*grab the type AND or OR*/
  private function getPreposition(&$condition){
    $intraPrep = (isset($condition['_prep_'])) ? 
      ' '.trim(strtoupper($condition['_prep_'])).' ' : ' AND ';
    unset($condition['_prep_']);
    return $intraPrep;
  }
  
  private function getDistinct(&$condition){
    $pre = (isset($condition['_distinct_'])) ? 'DISTINCT' : null;
    unset($condition['_distinct_']);
    return $pre;
  }
  /*$conditions is transformed by EndPoint. Each json object is represented as an assoc array.
    Those objects are wrapped in a indexed array. Each object represents a preposition (aka a
    series of logical statements. Each preposition has to share the same logical operator. The
    default is 'AND' the user can specify one by adding a '_prep_' key to thei JSON object w/
   'OR'. Prepositions will be linked using 'AND's by default. To link a preposition to the next
   one using an 'OR' the user can set '_interPrep_' key to 'OR'.*/
  private function addConditions($query, $conditions){
    $interPrepOp = ' AND ';
    $condLen = 0;
    $tempPrep = array();
    $returnObj = new stdClass();
    $returnObj->query = $query;
    $returnObj->conditions = array();
    $returnObj->values = array();
    
    if(count($conditions) > 0){
      $returnObj->query .= ' WHERE ';
      
      foreach($conditions as $condition){

        $intraPrep = $this->getPreposition($condition);
        $compOp = $this->getCompOp($condition);
        $limitObj = $this->getLimit($condition);
        $distinct = $this->getDistinct($condition);
        
        foreach($condition as $col => $val){
          if(strcmp($col,'_interPrep_') == 0){
            continue;
          }
          $tempPrep[] = "$col $compOp ?";
          $returnObj->values[] = $val;
        }
        
        if(count($tempPrep) < 1)
          continue; 
          
        /*push preposition onto queue*/
        $returnObj->conditions[] = '('.implode($intraPrep , $tempPrep).')';
        
        /*interPrepOp is the inter-prepositional operator declared in the previous prepostion object*/
        if(($condLen = count($returnObj->conditions)) == 1){
          $returnObj->query .= $returnObj->conditions[$condLen-1];
        }else{
          $returnObj->query .= $interPrepOp . $returnObj->conditions[$condLen-1];
        }
        
        $interPrepOp = ' AND ';
        
        if(isset($condition['_interPrep_'])){
          $interPrepOp = ' '.trim(strtoupper($condition['_interPrep_'])).' ';
        }
        
        /*wrap proposition in parenthesis */
        $tempPrep = array();
      }
      
      if(isset($limitObj->limit)){
        $returnObj->query .= ' LIMIT ' . $limitObj->limit;
      }
      
      if(isset($limitObj->limitOffset)){
        $returnObj->query .= ' OFFSET ' . $limitObj->limitOffset;
      }
      
      if(isset($distinct)){
        $returnObj->query = str_replace('__pre__', $distinct , $returnObj->query);
      }
      
    }
    $returnObj->query = str_replace('__pre__', '' , $returnObj->query);
    /*add conditions to typedef string*/
    $this->addToTypedefString(count($returnObj->values));
    $this->bindArray = array_merge($this->bindArray, $returnObj->values);
    return $returnObj->query;
  }
  
  /*---Statement Preparation---*/
  private function prepInsert($stmt, $dataParts){
    $this->bindArray = array(str_repeat('s', count($dataParts->values)));
    $this->bindArray = array_merge($this->bindArray, $dataParts->values);
    $output = str_replace('__names__', implode(',', $dataParts->columns) , $stmt);
    return trim(str_replace('__values__', $dataParts->vQs , $output));
  }

  private function prepUpdate($stmt, $dataParts){
    $this->bindArray = array(str_repeat('s', count($dataParts->values)));
    $this->bindArray = array_merge($this->bindArray, $dataParts->values);
    $parts = array();
    /*'hard-code' column names and use '?'s for values*/
    for($i = 0; $i < count($dataParts->columns); $i++){
      $parts[] = implode(' = ',array($dataParts->columns[$i] , '?'));
    }
    return trim(str_replace('__pair__', implode(' , ',$parts) , $stmt));
  }

  private function prepSelect($stmt, $dataParts){
    if(count($dataParts->columns) > 0){
      $output = str_replace('__columns__', implode(' , ', $dataParts->columns) , $stmt);
    }else{
      $output = str_replace('__columns__', '*' , $stmt);
    }
    return $output;
  }
  
  private function prep($keyValArr = array(), $tableName){
    $query = '';
    $stmt = $this->actionMap[$this->action];
    $stmt = str_replace('__table__', $tableName , $stmt);
    $dataParts = $this->parseData($keyValArr);
    
    
    switch($this->action){
      case 'insert':
        $query = $this->prepInsert($stmt, $dataParts);
        break;
      case 'update':
        $query = $this->prepUpdate($stmt, $dataParts);
        break;
      case 'delete':
        /*delete statement only using conditions. So we use the raw statement. Of course
          the table name has been interpolated first though.*/
        $query = $stmt;
        break;
      case 'select':
        $query = $this->prepSelect($stmt, $dataParts);
        /* if pre still exists remove it */
        break;
    }
    return $query;
  }
  
  public function Exec($data, $conditions, $tableName){
    $query = $this->prep($data, $tableName);
    $query = $this->addConditions($query, $conditions);
    $stmt = $this->connection->prepare($query);
    $this->prepBindArray();
    $this->bindParam->invokeArgs($stmt, $this->bindArray);
    $stmt->execute();
    /*affected rows exists on the statement object so we pass it to the caller*/
    return $stmt;
  }
  
}
?>