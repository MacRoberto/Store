<?php
$user_db = "root";
$password_db = "";
$host_db = "localhost";
$name_db = "punto_venta";

try {
    $db = new PDO("mysql:host=$host_db;dbname=$name_db", $user_db, $password_db);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
}
?>