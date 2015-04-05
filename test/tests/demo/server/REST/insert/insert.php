<?php
include '../EndPoint.php';

$endPoint = new EndPoint('Insert');
$endPoint->setData($_REQUEST['data']);

if(isset($_REQUEST['conditions']))
  $endPoint->setConditions($_REQUEST['conditions']);
  
$endPoint->performAction();
  
echo $endPoint->response;
?>