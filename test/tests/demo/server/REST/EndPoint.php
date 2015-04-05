<?php
include '../Response.php';
include '../Statement.php';
class DatabaseConfig {
  public static $host = 'localhost';
  public static $user_name = 'root';
  public static $password = '';
  public static $db_name = 'test';
  public static $salt = 'lCBZToMddHrM4FmKQP6aHBKeJS5oBw';
}

class EndPoint{
  public $response;
  public $connection;
  private $action;
  private $data;
  private $conditions;
  public static $actions = array('insert', 'update', 'delete', 'select');
  
  public function __construct($action = 'insert'){
    $this->response = new Response();
    $data = array();
    $dbc = new DatabaseConfig();
    $this->connection = mysqli_connect($dbc::$host, $dbc::$user_name, $dbc::$password, $dbc::$db_name);
    
    if(!$this->connection)
      die('DB Connect Failed');
    
    $this->action = strtolower($action);
    $this->data = array();
    $this->conditions = array();
    if(!in_array($this->action, $this::$actions)){
      throw new Exception('Unrecognized Action "'.$action.'"');
    }
    
  }
  
  private function transformAndStore(&$member, $data){
    $decoded = json_decode($data);
    $decoded = (isset($decoded)) ? $decoded : new stdClass();
    if(is_array($decoded)){
      for($i = 0; $i < count($decoded); $i++){
        $decoded[$i] = get_object_vars($decoded[$i]);
      }
      
    }else{
      $converted = get_object_vars($decoded);
      $decoded = array();
      if(count($converted) > 0){
        $decoded[] = $converted;
      }

    }
    
    $member = $decoded;
  }
  /*Data is set as a array of associative arrays*/
  public function setData($data = array()){
    $this->transformAndStore($this->data, $data);
  }
  
  public function setConditions($data = array()){
    $this->transformAndStore($this->conditions, $data);
  }
  
  public function performAction(){
    $query = '';
    $Statement = new Statement($this->connection, $this->action);
    
    switch ($this->action) {
      case 'insert':
        foreach($this->data as $data){
          $Statement->exec($data, $this->conditions);
          $this->response->set('error', $this->connection->error);
        }
        
        break;
      case 'update':
        break;
      case 'delete':
        break;
      case 'select':
        break;

    }
  }
}

?>