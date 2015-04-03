<?php

include 'setup/connect.php'; 

$response = array('error' => '', 
                  'insertId' => -1,
                  'debug' => '');

$uid = $_REQUEST['uid'];
$details = $_REQUEST['details'];
$response['debug'] = print_r($details, true);
$insertPassed = false;
$savePhoneNum = (strtolower($details['save_phone_num']) === 'true') ? true : false;
$insertQuery = <<<EOD
          INSERT INTO ads 
          (uid, state, city, price, title, description, 
           ad_type, ad_category, ad_state, end, phone_num, 
           contact_methods
           )
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?);
EOD;

$updateQuery = <<<EOD
          UPDATE user 
          SET
          phone = ?
          WHERE
          uid = ?;
EOD;

$stmt = $mysqli->prepare($insertQuery);
$stmt->bind_param("ssssssssssss", 
                  $uid, 
                  $details['state'],
                  $details['city'],
                  $details['price'],
                  $details['title'],
                  $details['description'],
                  $details['ad_type'],
                  $details['ad_category'],
                  $details['ad_state'],
                  $details['end'],
                  $details['phone_num'],
                  $details['contact_methods']);
$stmt->execute();


$response['error'] = $mysqli->error;

if(strlen($response['error']) == 0){
  $response['insertId'] = $mysqli->insert_id;
  $insertPassed = true;
  /*check if update phone num*/
}

if($insertPassed == true && $savePhoneNum == true){
    $stmt = $mysqli->prepare($updateQuery);
    $stmt->bind_param('ss',$details['phone_num'], $uid);
    $stmt->execute();
}

$response['error'] = $mysqli->error;

echo json_encode($response);


?>