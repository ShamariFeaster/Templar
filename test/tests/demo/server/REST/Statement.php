<?php

class Statement {
  public static $insertQuery ='INSERT INTO __table__ (__names__) VALUES (__values__)';
  public static $updateQuery ='UPDATE __table__ SET __pair__';

  private $connection;
  private $actionMap;//could be static
  private $bindParam;//could be static
  private $bindArray;
  
  public function __construct(&$conn ,$action = ''){
    $this->connection = $conn;
    $this->action = $action;
    $this->actionMap = array('insert' => self::$insertQuery,
                             'update' => self::$updateQuery);
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
          $tempCond[] = "$col = ?";
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
  
  private function parseData($keyValArr){
    $returnObj = new stdClass();
    $returnObj->columns =  array_keys($keyValArr);
    $returnObj->cQs = implode(',',array_fill(0, count($returnObj->columns) , '?'));
    
    $returnObj->values = array_values($keyValArr);
    $returnObj->vQs = implode(',',array_fill(0, count($returnObj->values) , '?'));
    
    return $returnObj;
  }
  
  /*---Statement Preparation---*/
  private function prepInsert($stmt, $dataParts){
    $output = str_replace('__names__', implode(',', $dataParts->columns) , $stmt);
    return trim(str_replace('__values__', $dataParts->vQs , $output));
  }
  
  /* UPDATE ads SET __pair__ */
  private function prepUpdate($stmt, $dataParts){
    $parts = array();
    
    for($i = 0; $i < count($dataParts->columns); $i++){
      $parts[] = implode(' = ',array($dataParts->columns[$i] , '?'));
    }
    /*add columns to typedef string*/
    $this->bindArray[0] = $this->bindArray[0].str_repeat('s', count($dataParts->columns));
    return trim(str_replace('__pair__', implode(' , ',$parts) , $stmt));
  }

  private function prep($keyValArr = array(), $tableName){
    $query = '';
    $stmt = $this->actionMap[$this->action];
    $stmt = str_replace('__table__', $tableName , $stmt);
    $dataParts = $this->parseData($keyValArr);
    $this->bindArray = array(str_repeat('s', count($dataParts->values)));
    $this->bindArray = array_merge($this->bindArray, $dataParts->values);
    
    switch($this->action){
      case 'insert':
        $query = $this->prepInsert($stmt, $dataParts);
        break;
      case 'update':
        $query = $this->prepUpdate($stmt, $dataParts);
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
  }
  
}



?>

