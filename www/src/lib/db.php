<?php
$user_db ="avnadmin";
$password_db = "AVNS_GIgns9KLWvKVq7-9llC";
$host_db = "mysql-5761ae9-developer-065c.a.aivencloud.com";
$name_db = "store";
$port_db = "25710";

try {
    $db = new PDO("mysql:host=$host_db; port=25710; dbname=$name_db", $user_db, $password_db);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>