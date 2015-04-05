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
    $intraPrep = ' AND ';
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

        /*grab the type AND or OR*/
        if(isset($condition['_prep_'])){
          $intraPrep = ' '.trim(strtoupper($condition['_prep_'])).' ';
          unset($condition['_prep_']);
        }

        foreach($condition as $col => $val){
          if(strcmp($col,'_interPrep_') == 0){
            continue;
          }
          $tempPrep[] = "$col = ?";
          $returnObj->values[] = $val;
        }
        /*push preposition onto queue*/
        $returnObj->conditions[] = '('.implode($intraPrep , $tempPrep).')';
        
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
      
    }
    /*add conditions to typedef string*/
    $this->addToTypedefString(count($returnObj->values));
    $this->bindArray = array_merge($this->bindArray, $returnObj->values);
    return $returnObj->query;
  }
  
  private function addToTypedefString($count){
    $this->bindArray[0] .= str_repeat('s', $count);
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
    //$this->addToTypedefString(count($dataParts->columns));
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

