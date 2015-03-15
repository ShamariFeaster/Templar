<?php

include 'setup/connect.php'; 

$response = array('error' => '', 'id' => -1);
$errors = array();

/*SS Validation*/
if(($len = strlen($_REQUEST['username'])) < 8 || $len > 20 ){
  $response['error'] .= 'Invalid Username Length ';
}

if(($len = strlen($_REQUEST['password'])) < 8 || $len > 28 ){
  $response['error'] .= 'Invalid Password Length ';
}

$sanitized_email = filter_var($_REQUEST['email'], FILTER_SANITIZE_EMAIL);
if (!filter_var($sanitized_email, FILTER_VALIDATE_EMAIL)) {
  $response['error'] .= 'Invalid Email Format';
}

if(count($errors) > 0){
  die(json_encode($response));
}
function makeSalt(){
  $salt = mcrypt_create_iv(22, MCRYPT_DEV_URANDOM);
  $salt = base64_encode($salt);
  return str_replace('+', '.', $salt);
}

function pw_hash($input, $salt){
  return crypt($input, '$2y$10$'.$salt.'$');
}

$escapedUn = $mysqli->real_escape_string($_REQUEST['username']);
$encrpytedPw = pw_hash($mysqli->real_escape_string($_REQUEST['password']), $dbc::$salt);

$query = "INSERT INTO credentials (un, pw) VALUES ('$escapedUn', '$encrpytedPw')";

$mysqli->query($query);

$insertId = $mysqli->insert_id;
$response['id'] = $insertId;
$response['error'] = $mysqli->error;

$query = "INSERT INTO user (uid, email) VALUES ('$insertId', '$sanitized_email')";

$mysqli->query($query);
$response['error'] = $mysqli->error;


echo json_encode($response);


?>