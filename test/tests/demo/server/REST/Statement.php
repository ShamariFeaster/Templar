<?php

class Statement {
  public static $insertQuery ='INSERT INTO ads (__names__) VALUES (__values__)';
  public static $updateQuery ='UPDATE ads SET (__names__) = (__values__)';

  private $connection;
  private $actionMap;//could be static
  private $bindParam;//could be static
  private $bindArray;
  
  public function __construct(&$conn ,$action = ''){
    $this->connection = $conn;
    $this->action = $action;
    $this->actionMap = array('insert' => self::$insertQuery);
    $this->bindParam = (new ReflectionClass('mysqli_stmt'))->getMethod('bind_param'); 
    
  }
  
  private function prepBindArray(){
    for($i = 0; $i < count($this->bindArray); $i++){
      $this->bindArray[$i] = &$this->bindArray[$i];
    }
  }

  private function addConditions($query, $conditions){
    $type = 'AND';
    $tempCond = array();
    $returnObj = new stdClass();
    $returnObj->query = $query;
    $returnObj->conditions = array();
    $returnObj->values = array();
    
    if(count($conditions) > 0){
      $returnObj->query .= ' WHERE ';
      
      
      foreach($conditions as $condition){
        /*grab the type AND or OR*/
        if(isset($condition['type'])){
          $type = trim(strtoupper($condition['type']));
          unset($condition['type']);
        }
        
        foreach($condition as $col => $val){
          $tempCond[] = "'$col' = ?";
          $returnObj->values[] = $val;
        }
        /*wrap proposition in parenthesis */
        $returnObj->conditions[] = '('.implode(' '.$type.' ' , $tempCond).')';
        $tempCond = array();
      }
      
    }
    $this->bindArray = array_merge($this->bindArray, $returnObj->values);
    return $returnObj->query.implode(' AND ' , $returnObj->conditions) ;
  }
  
  /*---Statement Preparation---*/
  private function prepInsert($keyValArr){
    $columns =  array_keys($keyValArr);
    $cQs = implode(',',array_fill(0, count($columns) , '?'));
    
    $colVals = array_values($keyValArr);
    $cvQs = implode(',',array_fill(0, count($colVals) , '?'));
    
    $stmt = $this->actionMap[$this->action];
    
    $this->bindArray = array(str_repeat('s', count($colVals)));
    $this->bindArray = array_merge($this->bindArray, $colVals);
    
    /*putting '?'s in query string*/
    $output = str_replace('__names__', implode(',', $columns) , $stmt);
    return trim(str_replace('__values__', $cvQs , $output));
  }
  
  private function prepUpdate($keyValArr){
  
  }

  private function prep($keyValArr = array()){
    $query = '';
    switch($this->action){
      case 'insert':
        $query = $this->prepInsert($keyValArr);
        break;
      case 'update':
        $query = $this->prepUpdate($keyValArr);
        break;
    }
    return $query;
  }
  
  public function exec($data, $conditions){
    $query = $this->prep($data);
    $query = $this->addConditions($query, $conditions);
    $stmt = $this->connection->prepare($query);
    $this->prepBindArray();
    $this->bindParam->invokeArgs($stmt, $this->bindArray);
    //$stmt->execute();
  }
  
}



?>

