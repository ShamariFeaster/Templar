<?php

include 'setup/connect.php'; 

$response = array('error' => '', 'extra' => '');
print_r($_FILES);
$img_path = $_FILES['profile_pic']['tmp_name'];
$image_mime = $_FILES['profile_pic']['type'];

$response['extra'] = 'Image Path: '.$img_path.' | Mime: '.$image_mime;

$blob = fopen($img_path,'rb');

$mysqli->query("INSERT profile_pic, pp_mime INTO user VALUES ('$blob', '$image_mime')");
$response['error'] = $mysqli->error;

echo json_encode($response);

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