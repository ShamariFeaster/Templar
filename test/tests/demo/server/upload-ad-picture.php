<?php

include 'setup/connect.php'; 

$response = array('error' => '', 
                  'uploadStatus' => 0,
                  'image_id' => -1,
                  'image_uri' => -1);

$img_path = $_FILES['ad_pic']['tmp_name'][0];
$image_mime = $_FILES['ad_pic']['type'][0];
$img_size = $_FILES['ad_pic']['size'][0];
$img_name = $_FILES['ad_pic']['name'][0];
$uid = $_REQUEST['uid'];

$uploadDir = 'ad_pics/';
$hashedName = md5($uid.$img_size.$img_name);
$targetFile = $uploadDir . $hashedName;//should throw in timestamp

if(move_uploaded_file($img_path, $targetFile)){

  $query = <<<EOD
            INSERT INTO ad_pics 
            (image_uri)
            VALUES
            (?);
EOD;

  $stmt = $mysqli->prepare($query);
  $stmt->bind_param("s", $hashedName);
  $stmt->execute();

  $response['error'] = $mysqli->error;

  if(strlen($response['error']) == 0){
    $response['image_id'] = $insertId = $mysqli->insert_id;
    $response['image_uri'] = $hashedName;
    $response['uploadStatus'] = 1;
  }

}
//echo print_r($response);

header('Location: /Templar/test/tests/demo/#/new-ad/4'
        .'/id/'
        .$response['image_id']
        .'/uri/'
        .$response['image_uri']);


?>