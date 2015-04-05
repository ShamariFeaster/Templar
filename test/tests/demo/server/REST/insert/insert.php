<?php
include '../EndPoint.php';

$endPoint = new EndPoint('Insert');
$endPoint->setData($_REQUEST['data']);
$endPoint->performAction();
echo $endPoint->response;
?>