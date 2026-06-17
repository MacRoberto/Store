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


function getAllProducts() {
    global $db;
    try {
        // Hacemos un JOIN para obtener el nombre de la categoría asignada al producto
        $query = "SELECT p.id_product, p.barcode, p.name AS product_name, p.description, 
                         p.reorder_level, p.status, p.unit, c.name AS category_name 
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.id_cat
                  ORDER BY p.id_product DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
?>