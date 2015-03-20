<?php

include 'setup/connect.php'; 

$response = array('error' => '', 
                  'extra' => '', 
                  'fn' => '',
                  'ln' => '',
                  'sex' => '',
                  'city' => '',
                  'state' => '',
                  'success_msg' => '');

$uid = $_REQUEST['uid'];
$fn = $_REQUEST['fn'];
$ln = $_REQUEST['ln'];
$age = $_REQUEST['age'];
$sex = $_REQUEST['sex'];
$state = $_REQUEST['state'];
$city = $_REQUEST['city'];
$desc = $_REQUEST['description'];

$query = <<<EOD
          UPDATE user 
          SET
          fn = ?,
          ln = ?,
          age = ?,
          sex = ?,
          state = ?,
          city = ?,
          description = ?
          WHERE uid = ?;
EOD;
$stmt = $mysqli->prepare($query);
$stmt->bind_param("sssssssi", $fn, $ln, $age, $sex, $state, $city, $desc, $uid);
$stmt->execute();

$response['error'] = $mysqli->error;

if(strlen($response['error']) == 0){
  $response['fn'] = $fn;
  $response['ln'] = $ln;
  $response['age'] = $age;
  $response['sex'] = $sex;
  $response['state'] = $state;
  $response['city'] = $city;
  $response['description'] = $desc;
  $response['success_msg'] = 'Profile Updated';
}

echo json_encode($response);
?>