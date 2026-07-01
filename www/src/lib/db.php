<?php
$user_db = getenv('DB_USER') ?: getenv('MYSQL_USER') ?: 'app_user';
$password_db = getenv('DB_PASSWORD') ?: getenv('MYSQL_PASSWORD') ?: 'app_password';
$host_db = getenv('DB_HOST') ?: getenv('MYSQL_HOST') ?: 'mysql';
$name_db = getenv('DB_NAME') ?: getenv('MYSQL_DATABASE') ?: 'app_db';
$port_db = getenv('DB_PORT') ?: '3306';

try {
    $db = new PDO("mysql:host=$host_db; port=$port_db; dbname=$name_db;charset=utf8mb4", $user_db, $password_db);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $db = null;
    error_log('Error de conexión: ' . $e->getMessage());
}
?>