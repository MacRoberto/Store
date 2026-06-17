<?php
$user_db ="app_user"
$password_db = "app_pass";
$host_db = "mysql";//("localhost") para mysql;
$name_db = "app_db";

try {
    $db = new POO("mysql:host=$host")
} catch (\Throwable $th) {
    //throw $th;
}
?>