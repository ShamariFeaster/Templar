<?php
class BindParam{ 
    private $values = array(), $types = ''; 
    
    public function add( $type, &$value ){ 
        $this->values[] = $value; 
        $this->types .= $type; 
    } 
    
    public function get(){ 
        return array_merge(array($this->types), $this->values); 
    } 
} 


class Statement {
  public static $insertQuery ='INSERT INTO ads (__names__) VALUES (__values__);';

  private $columns;
  private $values;
  private $connection;
  private $actionMap;
  private $bindParam;
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
  
  public function prep($keyValArr = array()){
    $columns =  array_keys($keyValArr);
    $cQs = implode(',',array_fill(0, count($columns) , '?'));
    
    $colVals = array_values($keyValArr);
    $cvQs = implode(',',array_fill(0, count($colVals) , '?'));
    
    $stmt = $this->actionMap[$this->action];
    
    $this->bindArray = array(str_repeat('s', count($colVals)));
    $this->bindArray = array_merge($this->bindArray, $colVals);
    $this->prepBindArray();
    /*putting '?'s in query string*/
    $output = str_replace('__names__', implode(',', $columns) , $stmt);
    return trim(str_replace('__values__', $cvQs , $output));
  }
  
  public function exec($data){
    $query = $this->prep($data);
    $stmt = $this->connection->prepare($query);
    $this->bindParam->invokeArgs($stmt, $this->bindArray);
    $stmt->execute();
  }
  
}



?>

