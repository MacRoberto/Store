<?php
require_once __DIR__ . "/lib/db.php";
require_once __DIR__ ."/helpers.php";
//Quiero realizar un login, buscando en la tabla de usuario por email y contraseña
function login($email, $password) {
    global $db;

    $stmt = $db->prepare("SELECT * FROM users WHERE username = :email AND password_hash = :password");

    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/** Funciones para el modulo de categorias */
// Función para recuperar registros de la tabla categories
function getAllCategories() {
    global $db;
    $stmt = $db->query("SELECT id_cat AS id, name, description FROM categories");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

//funcion para guardar un producto
function saveCategories( $name, $description) {
    global $db;
    try {
        $query = "INSERT INTO categories (name, description)
                    VALUES ( :name, :description)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//funcion para actualizar informacion de un producto
function updateCategories($id_cat, $name, $description) {
    global $db;
    try {
        $query = "UPDATE categories 
                  SET name = :name, description = :description
                  WHERE id_cat = :id_cat";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function deleteCategories($id) {
    global $db;
    try {
        $query = "DELETE FROM categories WHERE id_cat = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//Funcion para recuperar un registro en especifico
function getCategoryById($id_cat){
    global $db;
    try {
        $query = "SELECT id_cat AS id, name, description FROM categories WHERE id_cat = :id_cat";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
/*Fin de funciones para el modulo de productos*/

//Funcion para recuperar id y nombre de gategorias, el cual sirve para llenar el select en productos

function getCategoryOptions() {
    global $db;
    $stmt = $db->query("SELECT id_cat as id, name FROM categories");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/** Fin de Funciones para el modulo de categorias */

/*Funciones para el modulo de productos*/
//
function getAllProducts($requestData) {
    global $db;
    try {

        // Configuración del listado.
        $page = max(1, (int) ($requestData["page"] ?? 1)); // por defecto 1
        $limit = max(1, (int) ($requestData["limit"] ?? 50)); // por defecto 1

        $orderBy = getProductOrderField(
            $requestData["orderBy"] ?? "id_product"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        // Calcular desde qué registro iniciará la consulta.
        $offset = ($page - 1) * $limit;

        // Obtener el total de productos.
        $total = getTotalProducts();

        // Hacemos un JOIN para obtener el nombre de la categoría asignada al producto
        $query = "SELECT p.id_product, p.barcode, p.name AS product_name, p.description, 
                         p.reorder_level, p.status, p.units, c.name AS category_name 
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.id_cat
                  where p.deleted_at IS NULL
                  ORDER BY $orderBy $orderDirection 
                  LIMIT :limit OFFSET :offset ";
                  
        $stmt = $db->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return [
            "records" => $records,
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "totalPages" => (int) ceil($total / $limit)
        ];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//funcion para cambiar el estatus de un producto 

function softDeleteProduct($id_product){
    global $db ;
    try {
        $query = "UPDATE products Set deleted_at = now() WHERE id_product = :id_product";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_product', $id_product);
        $stmt->execute();
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//funcion para guardar un producto
function saveProduct($barcode, $name, $category_id, $description, $reorder_level, $status, $units) {
    global $db;
    try {
        $query = "INSERT INTO products (barcode, name, description, reorder_level, status, units, category_id)
                    VALUES (:barcode, :name, :description, :reorder_level, :status, :units, :category_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':barcode', $barcode);
        $stmt->bindparam(':name', $name);
        $stmt->bindparam(':description', $description);
        $stmt->bindparam(':reorder_level', $reorder_level);
        $stmt->bindparam(':units', $units);
        $stmt->bindparam(':status', $status);
        $stmt->bindparam(':category_id', $category_id);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//funcion para actualizar informacion de un producto
function updateProduct($id_product, $barcode, $name, $category_id, $description, $reorder_level, $status, $units) {
    global $db;
    try {
        $query = "UPDATE products 
                  SET barcode = :barcode, name = :name, description = :description, 
                      reorder_level = :reorder_level, status = :status, units = :units,
                      category_id = :category_id
                  WHERE id_product = :id_product";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':barcode', $barcode);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':reorder_level', $reorder_level);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':units', $units);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':id_product', $id_product);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

//Funcion para recuperar un registro en especifico
function getProductById($id_product){
    global $db;
    try {
        $query = "SELECT * FROM products WHERE id_product = :id_product";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_product', $id_product);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getProductOptions() {
    global $db;
    $stmt = $db->query("SELECT id_product as id, name FROM products");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Valida el campo utilizado para ordenar el listado de productos
 * y devuelve el nombre de la columna correspondiente en la consulta SQL.
 */
function getProductOrderField($field) {
    $fields = [
        "id_product" => "p.id_product",
        "product_name" => "p.name",
        "barcode" => "p.barcode",
        "category_name" => "c.name",
        "reorder_level" => "p.reorder_level",
        "status" => "p.status",
        "units" => "p.units"
    ];

    return $fields[$field] ?? "p.id_product";
}

// Obtiene el total de productos activos que no han sido eliminados lógicamente.
function getTotalProducts() {
    global $db;

    $query = "SELECT COUNT(*)
              FROM products
              WHERE deleted_at IS NULL";

    $stmt = $db->prepare($query);
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

/*Fin de funciones para el modulo de productos*/

//Inicio de funciones para promociones
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

//Crear funcion para guardar un registro de Promotions

function savePromotion( $name, $description, $date_start, $date_end, $percent_off, $id_product, $status) {
    global $db;
    try {
        $query = "INSERT INTO promotions ( name, description, date_start, date_end, percent_off, id_product, status)
                    VALUES (:name, :description, :date_start, :date_end, :percent_off, :id_product, :status)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':date_start', $date_start);
        $stmt->bindParam(':date_end', $date_end);
        $stmt->bindParam(':percent_off', $percent_off);
        $stmt->bindParam(':id_product', $id_product);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// crear funcion para editar el registro de Promotions
function updatePromotion($id_promotion, $name, $description, $date_start, $date_end, $percent_off, $id_product, $status) {
    global $db;
    try {
        $query = "UPDATE promotions 
                  SET name = :name, description = :description, date_start = :date_start, date_end = :date_end, percent_off = :percent_off, id_product = :id_product, status = :status
                  WHERE id_promotion = :id_promotion";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_promotion', $id_promotion);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':date_start', $date_start);
        $stmt->bindParam(':date_end', $date_end);
        $stmt->bindParam(':percent_off', $percent_off);
        $stmt->bindParam(':id_product', $id_product);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// crear funcion para eliminar el registro de Promotions

function deletePromotion($id_promotion) {
    global $db;
    try {
        $query = "DELETE FROM promotions WHERE id_promotion = :id_promotion";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_promotion', $id_promotion);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// crear funcion para recuperar un registro en especifico de promocion filtrado por su id de Promotions

function getPromotionById($id_promotion) {
    global $db;
    try {
        $query = "SELECT id_promotion AS id, name, description, date_start, date_end, percent_off, id_product, status FROM promotions WHERE id_promotion = :id_promotion";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_promotion', $id_promotion);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
//Fin de funciones para promociones 


function getAllInventoryMovements() {
    global $db;
    try {
        $query = "SELECT m.id_movement, m.id_inventory_item, m.movement_type, 
                         m.quantity, m.movement_date, m.notes,
                         u.username AS username,
                         p.name AS item_name
                  FROM inventory_movements m
                  LEFT JOIN users u ON m.user_id = u.id_user
                  LEFT JOIN inventory_items ii ON m.id_inventory_item = ii.id_inventory_item
                  LEFT JOIN products p ON ii.product_id = p.id_product
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
                         p.name AS product_name
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
        $query = "SELECT sd.id_sale_item, sd.sale_id, sd.quantity, 
                         sd.unit_price, sd.discount_applied, sd.subtotal
                  FROM sales_details sd
                  ORDER BY sd.sale_id DESC, sd.id_sale_item ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'msg' => $e->getMessage()
        ];
    }
}

function getAllRoles($requestData = []) {
    global $db;

    try {
        $query = "SELECT r.id_rol, r.name, r.description
                  FROM roles r";

        $params = [];

        $filterType = $requestData["filterType"] ?? "";
        $filterValues = $requestData["filterValues"] ?? [];
        $orderDirection = strtoupper($requestData["orderDirection"] ?? "DESC");

        if ($orderDirection !== "ASC") {
            $orderDirection = "DESC";
        }

        if ($filterType === "name" && is_array($filterValues) && count($filterValues) > 0) {
            $placeholders = [];

            foreach ($filterValues as $index => $name) {
                $placeholder = ":name{$index}";
                $placeholders[] = $placeholder;
                $params[$placeholder] = $name;
            }

            $query .= " WHERE r.name IN (" . implode(",", $placeholders) . ")";
            $query .= " ORDER BY r.name ASC";

        } elseif ($filterType === "id") {
            $query .= " ORDER BY r.id_rol " . $orderDirection;

        } else {
            $query .= " ORDER BY r.name ASC";
        }

        $stmt = $db->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveRole($name, $description) {
    global $db;

    try {
        $stmt = $db->prepare("INSERT INTO roles (name, description) VALUES (:name, :description)");
        $stmt->execute([
            ':name' => $name,
            ':description' => $description
        ]);

        return [
            'status' => 'success',
            'msg' => 'Role saved successfully'
        ];
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'msg' => $e->getMessage()
        ];
    }
}

function getRoleById($id_rol) {
    global $db;

    $stmt = $db->prepare("SELECT id_rol, name, description FROM roles WHERE id_rol = :id_rol LIMIT 1");
    $stmt->execute([':id_rol' => $id_rol]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}





function updateRole($id_rol, $name, $description) {
    global $db;

    try {
        $stmt = $db->prepare("UPDATE roles SET name = :name, description = :description WHERE id_rol = :id_rol");
        $stmt->execute([
            ':id_rol' => $id_rol,
            ':name' => $name,
            ':description' => $description
        ]);

        return [
            'status' => 'success',
            'msg' => 'Role updated successfully'
        ];
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'msg' => $e->getMessage()
        ];
    }
}

function deleteRole($id_rol) {
    global $db;

    try {
        $stmt = $db->prepare("DELETE FROM roles WHERE id_rol = :id_rol");
        $stmt->execute([':id_rol' => $id_rol]);

        return [
            'status' => 'success',
            'msg' => 'Role deleted successfully'
        ];
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'msg' => $e->getMessage()
        ];
    }
}

function getAllModules() {
    global $db;
    try {
        // Consultamos el registro de módulos ordenados alfabéticamente por su nombre descriptivo
        $query = "SELECT m.id_module, m.name, m.description, m.img, m.url  
                  FROM modules m
                  ORDER BY m.name ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllActions() {
    global $db;
    try {
        // Ejecutamos un LEFT JOIN para obtener el nombre legible del módulo al que pertenece cada acción
        $query = "SELECT a.id_action, a.name AS action_name, a.description, a.id_module,
                         m.name AS module_name
                  FROM actions a
                  LEFT JOIN modules m ON a.id_module = m.id_module
                  ORDER BY m.name ASC, a.id_action ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllRolesPermissions() {
    global $db;
    try {
        // Ejecutamos una consulta con joins compuestos hacia roles, acciones y el respectivo módulo de la acción
        $query = "SELECT rp.id_permission, rp.id_role, rp.id_action, rp.status,
                         r.name AS role_name,
                         a.name AS action_name,
                         m.name AS module_name
                  FROM roles_permissions rp
                  LEFT JOIN roles r ON rp.id_role = r.id_rol
                  LEFT JOIN actions a ON rp.id_action = a.id_action
                  LEFT JOIN modules m ON a.id_module = m.id_module
                  ORDER BY r.name ASC, m.name ASC, a.name ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
?>