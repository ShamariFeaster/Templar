<?php

include 'setup/connect.php'; 

$username = mysql_real_escape_string($_REQUEST['username']);  
  
//mysql query to select field username if it's equal to the username that we check '  
$result = $mysqli->query('SELECT un FROM credentials WHERE un = "'. $username .'"');  
  
//if number of rows fields is bigger them 0 that means it's NOT available '  
if($result->num_rows > 0){  
    echo 0;  
}else{  
    echo 1;  
}  

?>