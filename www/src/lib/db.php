<?php
$user_db ="";
$password_db = " ";
$host_db = " ";
$name_db = " ";
$port_db = " ";

try {
    $db = new PDO("mysql:host=$host_db; port=25710; dbname=$name_db", $user_db, $password_db);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>
