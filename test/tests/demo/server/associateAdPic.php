<?php

include 'setup/connect.php'; 

$response = array('error' => '', 
                  'dbUpdateStatus' => -1,
                  'debug' => '');

$adID = $_REQUEST['adID'];
$images = $_REQUEST['imagesJson'];

$response['debug'] = '';

$query = <<<EOD
          UPDATE ad_pics 
          SET
          ad_id = ?
          WHERE
          ad_pic_id = ?;
EOD;

for($i = 0; $i < count($images); $i++){
  $stmt = $mysqli->prepare($query);
  $stmt->bind_param("ss", $adID, $images[$i]['id']);
  $response['debug'] .= $adID . ' ' . $images[$i]['id'];
  $stmt->execute();
}

$response['error'] = $mysqli->error;

if(strlen($response['error']) == 0){
  $response['dbUpdateStatus'] = 1;
}

echo json_encode($response);


?>