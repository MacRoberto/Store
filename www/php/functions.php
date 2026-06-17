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

function getAllPromotions() {
    global $db;
    try {
        // Hacemos un LEFT JOIN para jalar el nombre del producto vinculado a la promoción
        $query = "SELECT pr.id_promotion, pr.name AS promotion_name, pr.description, 
                         pr.date_start, pr.date_end, pr.percent_off, pr.status,
                         p.name AS product_name 
                  FROM promotions pr
                  LEFT JOIN products p ON pr.id_product = p.id_product
                  ORDER BY pr.date_start DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllInventoryMovements() {
    global $db;
    try {
        // Obtenemos los movimientos ordenados de los más recientes a los más antiguos
        // Nota: Asegúrate de que tu tabla de usuarios use la columna exacta (ej. u.name o u.username)
        $query = "SELECT m.id_movement, m.id_inventory_item, m.movement_type, 
                         m.quantity, m.movement_date, m.notes,
                         u.email AS username, i.name AS item_name 
                  FROM inventory_movements m
                  LEFT JOIN users u ON m.user_id = u.id_user
                  LEFT JOIN inventory_items i ON m.id_inventory_item = i.id_inventory_item
                  ORDER BY m.movement_date DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllInventoryItems() {
    global $db;
    try {
        // Ejecutamos JOINs hacia productos e inventarios (almacenes) principales
        // Nota: Ajusta 'inv.name' según el nombre exacto de la columna en tu tabla 'inventories'
        $query = "SELECT ii.id_inventory_item, ii.product_id, ii.id_inventory, 
                         ii.cost_price, ii.quantity_received, ii.quantity_available, 
                         ii.status, ii.sale_price,
                         p.name AS product_name,
                         inv.name AS inventory_name
                  FROM inventory_items ii
                  LEFT JOIN products p ON ii.product_id = p.id_product
                  LEFT JOIN inventories inv ON ii.id_inventory = inv.id_inventory
                  ORDER BY ii.id_inventory_item DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllSales() {
    global $db;
    try {
        // Consultamos el registro de ventas asociando el email del usuario correspondiente
        // Nota: Si tu columna identificadora de correo se llama distinto (ej: 'user_email'), cámbiala abajo
        $query = "SELECT s.id_sale, s.user_id, s.transaction_date, 
                         s.total_amount, s.payment_method, s.status,
                         u.email AS username
                  FROM sales s
                  LEFT JOIN users u ON s.user_id = u.id_user
                  ORDER BY s.transaction_date DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllInventories() {
    global $db;
    try {
        // Consultamos la tabla de inventarios vinculando los datos de la cuenta de usuario encargada
        $query = "SELECT i.id_inventory, i.user_id, i.arrival_date,
                         u.email AS username
                  FROM inventories i
                  LEFT JOIN users u ON i.user_id = u.id_user
                  ORDER BY i.arrival_date DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllUsers() {
    global $db;
    try {
        // Obtenemos los usuarios y su rol descriptivo. 
        // IMPORTANTE: Excluimos password_hash por completo por razones de seguridad.
        $query = "SELECT u.id_user, u.username, u.id_rol, u.status,
                         r.name AS role_name 
                  FROM users u
                  LEFT JOIN roles r ON u.id_rol = r.id_rol
                  ORDER BY u.id_user ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllSalesDetails() {
    global $db;
    try {
        // Obtenemos el desglose de ítems vendidos general histórico
        $query = "SELECT sd.id_sale_item, sd.sale_id, sd.quantity, 
                         sd.unit_price, sd.discount_applied, sd.subtotal
                  FROM sales_details sd
                  ORDER BY sd.sale_id DESC, sd.id_sale_item ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllRoles() {
    global $db;
    try {
        // Obtenemos los roles registrados ordenados por su ID correlativo
        $query = "SELECT r.id_rol, r.name, r.description 
                  FROM roles r
                  ORDER BY r.id_rol ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
?>