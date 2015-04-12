<?php
class Response {
  private $response = array('error' => array());
  
  public function __construct($keys = array()){
    if(isset($keys) && is_array($keys)){
      foreach ($keys as $key) {
        $this->set($key);
      }
    }
  }
  
  public function pushError($msg){
    if(!empty($msg)){
      $this->response['error'][] = $msg;
    }
    
  }
  
  public function set($key, $val = ''){
    $this->response[$key] = $val;
  }
  
  public function get($key){
    $retVal = NULL;
    if(isset($this->response[$key])){
      $retVal = $this->response[$key];
    }
    return $retVal;
  }
  
  public function __toString(){
    return json_encode($this->response);
  }                

}
?>