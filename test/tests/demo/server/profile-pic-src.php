<?php

include 'setup/connect.php'; 
$response = array( 'src' => '', 'error' => '');
$pp_dir = 'server/profile_pics/';
$uid = mysql_real_escape_string($_REQUEST['uid']);  
  
//mysql query to select field username if it's equal to the username that we check '  
$result = $mysqli->query('SELECT profile_pic_uri, pp_mime FROM user  WHERE uid = "'. $uid .'"');  
  
//if number of rows fields is bigger them 0 that means it's NOT available '  
if($result->num_rows > 0){  
  $row = $result->fetch_assoc();
  $filename = $row['profile_pic_uri'];
  $mime = $row['pp_mime'];
  $response['src'] = $pp_dir . $filename;// . '.' . substr($mime, strpos($mime, '/') + 1);
}else{
  $response['error'] = $mysqli->error;
}

echo json_encode($response);
?>