<?php

include 'setup/connect.php'; 

$response = array('error' => '', 
                  'dbDeleteStatus' => 0,
                  'fileDeleteStatus' => 0,
                  'debug' => '');

$uid = $_REQUEST['uid'];
$imageId = $_REQUEST['imageId'];
$imageUri = $_REQUEST['imageUri'];
$relativeUri = str_replace($CONFIG['ROOT_DIR'], '', $imageUri);

$response['debug'] = $relativeUri;

$query = <<<EOD
          DELETE FROM ad_pics 
          WHERE
          ad_pic_id = ?;
EOD;

$stmt = $mysqli->prepare($query);
$stmt->bind_param("s", $imageId);
$stmt->execute();

$response['error'] = $mysqli->error;

if(strlen($response['error']) == 0){
  $response['dbDeleteStatus'] = 1;
}

if(unlink($relativeUri) == true){
  $response['fileDeleteStatus'] = 1;
}

echo json_encode($response);


?>