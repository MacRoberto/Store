<?php
require_once __DIR__ . "/db.php";

//Quiero realizar un login, buscando en la tabla de usuario por email y contraseña
function login($email, $password) {
    global $db;

    $stmt = $db->prepare("SELECT * FROM users WHERE username = :email AND password_hash = :password");

    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Función para recuperar registros de la tabla categories
function getAllCategories() {
    global $db;
    $stmt = $db->query("SELECT id_cat, name, description FROM categories");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

?>