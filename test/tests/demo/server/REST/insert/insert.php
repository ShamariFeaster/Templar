<?php
include '../EndPoint.php';

$endPoint = new EndPoint('Update');
$endPoint->SetTableName('ads');
$endPoint->SetData($_REQUEST['data']);

if(isset($_REQUEST['conditions']))
  $endPoint->SetConditions($_REQUEST['conditions']);
  
$endPoint->PerformAction();
  
echo $endPoint->response;
?>