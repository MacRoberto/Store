<?php
$user_db ="Mark";
$password_db = "Id80M4Kkq^|}";
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