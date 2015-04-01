<?php
//Connect To DB Using DatabaseConfig Object
include 'db.php'; 
include 'config.php';
$dbc = new DatabaseConfig();
$mysqli = mysqli_connect($dbc::$host, $dbc::$user_name, $dbc::$password, $dbc::$db_name);
if(!$mysqli)
  die('DB Connect Failed');




                    



?>