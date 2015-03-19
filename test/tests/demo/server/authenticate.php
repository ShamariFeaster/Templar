<?php

include 'setup/connect.php'; 

$response = array('error' => '', 'id' => -1
                  , 'cookie' => array('status' => 403));
$errors = array();
$pp_dir = 'server/profile_pics/';
/*SS Validation*/
if(($len = strlen($_REQUEST['username'])) < 8 || $len > 20 ){
  $response['error'] .= 'Invalid Username Length ';
}

if(($len = strlen($_REQUEST['password'])) < 8 || $len > 28 ){
  $response['error'] .= 'Invalid Password Length ';
}

if(count($errors) > 0){
  die(json_encode($response));
}

function pw_hash($input, $salt){
  return crypt($input, '$2y$10$'.$salt.'$');
}

$escapedUn = $mysqli->real_escape_string($_REQUEST['username']);
$encrpytedPw = pw_hash($mysqli->real_escape_string($_REQUEST['password']), $dbc::$salt);

$query = "SELECT pw, uid FROM credentials WHERE un = '$escapedUn'";

$res = $mysqli->query($query);

if ($res->num_rows > 0) {
  $row = $res->fetch_assoc();
  $dbPw = $row['pw'];

  if(strcmp($encrpytedPw, $dbPw) === 0){
    $response['cookie']['status'] = 200;
    $response['cookie']['uid'] = $uid = $row['uid'];
    $response['cookie']['un'] = $_REQUEST['username'];
    
$query = <<<EOD
  SELECT role, sex, fn, ln, age, state, city, description, profile_pic_uri
  FROM user 
  WHERE uid = '$uid'
EOD;

    $result = $mysqli->query($query);
    if($result->num_rows > 0){  
      $row = $result->fetch_assoc();
      $response['cookie']['role'] = $row['role'];
      $response['cookie']['sex'] = $row['sex'];
      $response['cookie']['fn'] = $row['fn'];
      $response['cookie']['ln'] = $row['ln'];
      $response['cookie']['age'] = $row['age'];
      $response['cookie']['state'] = $row['state'];
      $response['cookie']['city'] = $row['city'];
      $response['cookie']['description'] = $row['description'];
      $response['cookie']['pp_src'] = $pp_dir.$row['profile_pic_uri'];
      $response['cookie']['profileExists'] = true;
    }else{
      $response['error'] .= $mysqli->error;
    }
  }
}

if(strlen($mysqli->error) > 0){
  $response['error'] = $mysqli->error;
  $response['cookie']['status'] = 500;
}


echo json_encode($response);


?>