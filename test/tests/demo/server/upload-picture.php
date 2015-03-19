<?php

include 'setup/connect.php'; 

$response = array('error' => '', 'extra' => '', 'uploadStatus' => 0);

$img_path = $_FILES['profile_pic']['tmp_name'][0];
$image_mime = $_FILES['profile_pic']['type'][0];
$img_size = $_FILES['profile_pic']['size'][0];
$img_name = $_FILES['profile_pic']['name'][0];
$uid = $_REQUEST['uid'];

$uploadDir = 'profile_pics/';
$hashedName = md5($uid.$img_size.$img_name);
$targetFile = $uploadDir . $hashedName;//should throw in timestamp

if(move_uploaded_file($img_path, $targetFile)){

$query = <<<EOD
  UPDATE user SET 
  profile_pic_uri = '$hashedName', 
  pp_mime = '$image_mime' 
  WHERE uid = '$uid'
EOD;

  $mysqli->query($query);
  $response['error'] = (strlen($mysqli->error) < 1) ? 'none' : $mysqli->error;
  $response['uploadStatus'] = (strlen($mysqli->error) < 1) ? 1 : 0;
  /*Not propagating error back to client*/
}

$response['extra'] = 'Image Path: '.$targetFile.' | Mime: '.$image_mime;
header('Location: /Templar/test/tests/demo/#/editProfile/'.$response['uploadStatus']);


/*
$username = mysql_real_escape_string($_REQUEST['username']);  
  
$result = $mysqli->query('SELECT un FROM credentials WHERE un = "'. $username .'"');  
  
if($result->num_rows > 0){  
    echo 0;  
}else{  
    echo 1;  
}  
*/
?>