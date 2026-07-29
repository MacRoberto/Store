<?php
require_once __DIR__ . "/lib/db.php";
require_once __DIR__ ."/helpers.php";

function getUserByEmail($email) {
    global $db;

        $stmt = $db->prepare("
        SELECT 
            u.id_user,
            u.username,
            u.password_hash,
            u.id_rol,
            u.status,
            r.name AS role
        FROM users u
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.username = :email
        AND u.status='Active'
        LIMIT 1
    ");

    $stmt->bindParam(':email', $email);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

//Quiero realizar un login, buscando en la tabla de usuario por email y contraseña
function verifyUserPassword($password, $storedPassword) {
    if (empty($storedPassword)) {
        return false;
    }

    return password_verify($password, $storedPassword);
}

function getRolePermissions($idRole) {
    global $db;

    $stmt = $db->prepare("
        SELECT 
            rp.id_permission,
            a.id_action,
            a.name AS action,
            a.id_module
        FROM role_permissions rp
        INNER JOIN actions a ON rp.id_action = a.id_action
        WHERE rp.id_role = :id_role
            AND rp.status = 'Active'
    ");

    $stmt->bindParam(':id_role', $idRole, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getRoleModules($idRole) {
    global $db;

    $stmt = $db->prepare("
        SELECT DISTINCT
            m.id_module,
            m.name AS module,
            m.img,
            m.url
        FROM role_permissions rp
        INNER JOIN actions a ON rp.id_action = a.id_action
        INNER JOIN modules m ON a.id_module = m.id_module
        WHERE rp.id_role = :id_role
          AND rp.status = 'Active'
    ");

    $stmt->bindParam(':id_role', $idRole, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/** Funciones para el modulo de categorias */
// Función para recuperar registros de la tabla categories
function getAllCategories($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));

        $orderBy = getCategoryOrderField(
            $requestData["orderBy"] ?? "id_cat"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getCategorySearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $offset = ($page - 1) * $limit;

        $total = getTotalCategories($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    c.name LIKE :search
                    OR c.description LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT
                    c.id_cat AS id,
                    c.name,
                    c.description
                  FROM categories c
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        if ($search !== "") {
            $stmt->bindValue(':search', "%$search%");
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
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

function getTotalCategories($searchField = "all", $search = "") {
    global $db;

    $where = "WHERE 1=1";
    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                c.name LIKE :search
                OR c.description LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT count(*)
              FROM categories c
              $where";

    $stmt = $db->prepare($query);
    if ($search !== "") {
        $stmt->bindValue(':search', "%$search%");
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getCategoryOrderField($field) {
    $fields = [
        "id_cat" => "c.id_cat",
        "name" => "c.name",
        "description" => "c.description"
    ];

    return $fields[$field] ?? "c.id_cat";
}

function getCategorySearchField($field) {
    $fields = [
        "name" => "c.name",
        "description" => "c.description"
    ];

    return $fields[$field] ?? "all";
}

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

        $searchField = getProductSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");

        // Calcular desde qué registro iniciará la consulta.
        $offset = ($page - 1) * $limit;

        // Obtener el total de productos.
        $total = getTotalProducts($searchField, $search);
        
        $where = "WHERE p.deleted_at IS NULL";
        if ($search !== "") {

            if ($searchField === "all") {
                $where .= " AND (
                    p.name LIKE :search
                    OR p.barcode LIKE :search
                    OR c.name LIKE :search
                    OR p.description LIKE :search
                    OR p.status LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }
        // Hacemos un JOIN para obtener el nombre de la categoría asignada al producto
        $query = "SELECT p.id_product, p.barcode, p.name AS product_name, p.description, 
                         p.reorder_level, p.status, p.units, c.name AS category_name 
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.id_cat 
                  $where 
                  ORDER BY $orderBy $orderDirection 
                  LIMIT :limit OFFSET :offset ";
             
        $stmt = $db->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }
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
function getTotalProducts($searchField = "", $search = "") {
    global $db;
    
    $where = "WHERE deleted_at IS NULL";

    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                p.name LIKE :search
                OR p.barcode LIKE :search
                OR c.name LIKE :search
                OR p.description LIKE :search
                OR p.status LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }
    $query = "SELECT count(*)  
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.id_cat 
              $where";

    $stmt = $db->prepare($query);

    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }

    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getProductSearchField($field) {
    $fields = [
        "product_name" => "p.name",
        "barcode" => "p.barcode",
        "category_name" => "c.name",
        "description" => "p.description",
        "status" => "p.status"
    ];

    return $fields[$field] ?? "all";
}

/*Fin de funciones para el modulo de productos*/

//Inicio de funciones para promociones
function getAllPromotions($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));

        $orderBy = getPromotionOrderField(
            $requestData["orderBy"] ?? "id_promotion"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getPromotionSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $offset = ($page - 1) * $limit;
        $total = getTotalPromotions($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    pr.name LIKE :search
                    OR pr.description LIKE :search
                    OR p.name LIKE :search
                    OR pr.status LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT pr.id_promotion, pr.name AS promotion_name, pr.description,
                         pr.date_start, pr.date_end, pr.percent_off, pr.status,
                         p.name AS product_name
                  FROM promotions pr
                  LEFT JOIN products p ON pr.id_product = p.id_product
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);

        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }

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

function getTotalPromotions($searchField = "", $search = "") {
    global $db;

    $where = "WHERE 1=1";

    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                pr.name LIKE :search
                OR pr.description LIKE :search
                OR p.name LIKE :search
                OR pr.status LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT count(*)
              FROM promotions pr
              LEFT JOIN products p ON pr.id_product = p.id_product
              $where";

    $stmt = $db->prepare($query);

    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }

    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getPromotionOrderField($field) {
    $fields = [
        "id_promotion" => "pr.id_promotion",
        "promotion_name" => "pr.name",
        "description" => "pr.description",
        "date_start" => "pr.date_start",
        "date_end" => "pr.date_end",
        "percent_off" => "pr.percent_off",
        "product_name" => "p.name",
        "status" => "pr.status"
    ];

    return $fields[$field] ?? "pr.id_promotion";
}

function getPromotionSearchField($field) {
    $fields = [
        "promotion_name" => "pr.name",
        "description" => "pr.description",
        "product_name" => "p.name",
        "status" => "pr.status"
    ];

    return $fields[$field] ?? "all";
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

function getAllSales($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));
        $offset = ($page - 1) * $limit;

        $orderBy = getSaleOrderField(
            $requestData["orderBy"] ?? "id_sale"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getSaleSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $total = getTotalSales($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    s.id_sale LIKE :search
                    OR u.username LIKE :search
                    OR s.payment_method LIKE :search
                    OR s.status LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT s.id_sale, s.user_id, s.transaction_date,
                         s.total_amount, s.payment_method, s.status,
                         u.username AS username
                  FROM sales s
                  LEFT JOIN users u ON s.user_id = u.id_user
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);

        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }

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

function getTotalSales($searchField = "", $search = "") {
    global $db;

    $where = "WHERE 1=1";

    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                s.id_sale LIKE :search
                OR u.username LIKE :search
                OR s.payment_method LIKE :search
                OR s.status LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT COUNT(DISTINCT s.id_sale)
              FROM sales s
              LEFT JOIN users u ON s.user_id = u.id_user
              $where";

    $stmt = $db->prepare($query);

    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }

    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getSaleOrderField($field) {
    $fields = [
        "id_sale" => "s.id_sale",
        "transaction_date" => "s.transaction_date",
        "username" => "u.username",
        "payment_method" => "s.payment_method",
        "total_amount" => "s.total_amount",
        "status" => "s.status"
    ];

    return $fields[$field] ?? "s.id_sale";
}

function getSaleSearchField($field) {
    $fields = [
        "id_sale" => "s.id_sale",
        "username" => "u.username",
        "payment_method" => "s.payment_method",
        "status" => "s.status"
    ];

    return $fields[$field] ?? "all";
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

function getAllUsers($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));

        $orderBy = getUserOrderField(
            $requestData["orderBy"] ?? "id_user"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getUserSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $offset = ($page - 1) * $limit;

        $total = getTotalUsers($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    u.username LIKE :search
                    OR r.name LIKE :search
                    OR u.status LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT u.id_user, u.username, u.id_rol, u.status,
                         r.name AS role_name
                  FROM users u
                  LEFT JOIN roles r ON u.id_rol = r.id_rol
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
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

function getTotalUsers($searchField = "all", $search = "") {
    global $db;

    $where = "WHERE 1=1";
    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                u.username LIKE :search
                OR r.name LIKE :search
                OR u.status LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT count(*)
              FROM users u
              LEFT JOIN roles r ON u.id_rol = r.id_rol
              $where";

    $stmt = $db->prepare($query);
    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getUserOrderField($field) {
    $fields = [
        "id_user" => "u.id_user",
        "username" => "u.username",
        "role" => "r.name",
        "status" => "u.status"
    ];

    return $fields[$field] ?? "u.id_user";
}

function getUserSearchField($field) {
    $fields = [
        "username" => "u.username",
        "role" => "r.name",
        "status" => "u.status"
    ];

    return $fields[$field] ?? "all";
}

function getUserById($id) {
    global $db;
    try {
        $query = "SELECT id_user AS id, username, id_rol, status
                  FROM users
                  WHERE id_user = :id_user";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_user', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getRoleOptions() {
    global $db;
    try {
        $query = "SELECT id_rol AS id, name
                  FROM roles
                  ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveUsers($username, $id_rol, $status, $password_hash) {
    global $db;
    try {
        $hashedPassword = password_hash($password_hash, PASSWORD_DEFAULT);

        $query = "INSERT INTO users (username, id_rol, status, password_hash)
                  VALUES (:username, :id_rol, :status, :password_hash)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':id_rol', $id_rol, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':password_hash', $hashedPassword);

        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function updateUsers($id, $username, $id_rol, $status, $password_hash = null) {
    global $db;
    try {
        if ($password_hash !== null && $password_hash !== "") {
            $hashedPassword = password_hash($password_hash, PASSWORD_DEFAULT);

            $query = "UPDATE users
                      SET username = :username,
                          id_rol = :id_rol,
                          status = :status,
                          password_hash = :password_hash
                      WHERE id_user = :id_user";
        } else {
            $query = "UPDATE users
                      SET username = :username,
                          id_rol = :id_rol,
                          status = :status
                      WHERE id_user = :id_user";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_user', $id, PDO::PARAM_INT);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':id_rol', $id_rol, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);

        if ($password_hash !== null && $password_hash !== "") {
            $stmt->bindParam(':password_hash', $hashedPassword);
        }

        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function deleteUsers($id) {
    global $db;
    try {
        $query = "DELETE FROM users WHERE id_user = :id_user";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_user', $id, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}



function getAllSalesDetails($requestData) {
    global $db;
    try {
        $saleId = (int) ($requestData["saleId"] ?? 0);
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));
        $offset = ($page - 1) * $limit;

        if ($saleId <= 0) {
            return [
                "records" => [],
                "total" => 0,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => 0,
                "saleId" => $saleId,
                "error" => "A valid saleId is required."
            ];
        }

        $orderBy = getSaleDetailOrderField(
            $requestData["orderBy"] ?? "id_sale_item"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getSaleDetailSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $total = getTotalSalesDetails($saleId, $searchField, $search);

        $where = "WHERE sd.sale_id = :saleId";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    sd.id_sale_item LIKE :search
                    OR p.name LIKE :search
                    OR sd.quantity LIKE :search
                    OR sd.unit_price LIKE :search
                    OR sd.discount_applied LIKE :search
                    OR sd.subtotal LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT sd.id_sale_item, sd.sale_id, sd.quantity,
                         sd.unit_price, sd.discount_applied, sd.subtotal,
                         p.name AS product_name
                  FROM sales_details sd
                  LEFT JOIN inventory_items ii ON sd.id_inventory_item = ii.id_inventory_item
                  LEFT JOIN products p ON ii.product_id = p.id_product
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        $stmt->bindValue(":saleId", $saleId, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);

        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }

        $stmt->execute();

        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return [
            "records" => $records,
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "totalPages" => (int) ceil($total / $limit),
            "saleId" => $saleId
        ];
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'msg' => $e->getMessage()
        ];
    }
}

function getTotalSalesDetails($saleId, $searchField = "", $search = "") {
    global $db;

    $where = "WHERE sd.sale_id = :saleId";

    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                sd.id_sale_item LIKE :search
                OR p.name LIKE :search
                OR sd.quantity LIKE :search
                OR sd.unit_price LIKE :search
                OR sd.discount_applied LIKE :search
                OR sd.subtotal LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT COUNT(DISTINCT sd.id_sale_item)
              FROM sales_details sd
              LEFT JOIN inventory_items ii ON sd.id_inventory_item = ii.id_inventory_item
                  LEFT JOIN products p ON ii.product_id = p.id_product
              $where";

    $stmt = $db->prepare($query);
    $stmt->bindValue(":saleId", $saleId, PDO::PARAM_INT);

    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }

    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getSaleDetailOrderField($field) {
    $fields = [
        "id_sale_item" => "sd.id_sale_item",
        "product_name" => "p.name",
        "quantity" => "sd.quantity",
        "unit_price" => "sd.unit_price",
        "discount_applied" => "sd.discount_applied",
        "subtotal" => "sd.subtotal"
    ];

    return $fields[$field] ?? "sd.id_sale_item";
}

function getSaleDetailSearchField($field) {
    $fields = [
        "id_sale_item" => "sd.id_sale_item",
        "product_name" => "p.name",
        "quantity" => "sd.quantity",
        "unit_price" => "sd.unit_price",
        "discount_applied" => "sd.discount_applied",
        "subtotal" => "sd.subtotal"
    ];

    return $fields[$field] ?? "all";
}

function getAllRoles($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));

        $orderBy = getRoleOrderField(
            $requestData["orderBy"] ?? "id_rol"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getRoleSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $offset = ($page - 1) * $limit;

        $total = getTotalRoles($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    r.name LIKE :search
                    OR r.description LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT
                    r.id_rol,
                    r.name,
                    r.description
                  FROM roles r
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
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

function getTotalRoles($searchField = "all", $search = "") {
    global $db;

    $where = "WHERE 1=1";
    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                r.name LIKE :search
                OR r.description LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT count(*)
              FROM roles r
              $where";

    $stmt = $db->prepare($query);
    if ($search !== "") {
        $stmt->bindValue(":search", "%$search%");
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getRoleOrderField($field) {
    $fields = [
        "id_rol" => "r.id_rol",
        "name" => "r.name",
        "description" => "r.description"
    ];

    return $fields[$field] ?? "r.id_rol";
}

function getRoleSearchField($field) {
    $fields = [
        "name" => "r.name",
        "description" => "r.description"
    ];

    return $fields[$field] ?? "all";
}

function getRoleById($id_rol) {
    global $db;
    try {
        $query = "SELECT id_rol AS id, name, description FROM roles WHERE id_rol = :id_rol";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_rol', $id_rol);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveRole($name, $description) {
    global $db;
    try {
        $query = "INSERT INTO roles (name, description)
                  VALUES (:name, :description)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function updateRole($id_rol, $name, $description) {
    global $db;
    try {
        $query = "UPDATE roles
                  SET name = :name, description = :description
                  WHERE id_rol = :id_rol";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_rol', $id_rol);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function deleteRole($id_rol) {
    global $db;
    try {
        $query = "DELETE FROM roles WHERE id_rol = :id_rol";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_rol', $id_rol, PDO::PARAM_INT);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function getAllModules($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));

        $orderBy = getModuleOrderField(
            $requestData["orderBy"] ?? "id_module"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getModuleSearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $offset = ($page - 1) * $limit;

        $total = getTotalModules($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    m.name LIKE :search
                    OR m.description LIKE :search
                    OR m.img LIKE :search
                    OR m.url LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT
                    m.id_module,
                    m.name,
                    m.description,
                    m.img,
                    m.url
                  FROM modules m
                  $where
                  ORDER BY $orderBy $orderDirection
                  LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        if ($search !== "") {
            $stmt->bindValue(':search', "%$search%");
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
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

function getTotalModules($searchField = "all", $search = "") {
    global $db;

    $where = "WHERE 1=1";
    if ($search !== "") {
        if ($searchField === "all") {
            $where .= " AND (
                m.name LIKE :search
                OR m.description LIKE :search
                OR m.img LIKE :search
                OR m.url LIKE :search
            )";
        } else {
            $where .= " AND $searchField LIKE :search";
        }
    }

    $query = "SELECT count(*)
              FROM modules m
              $where";

    $stmt = $db->prepare($query);
    if ($search !== "") {
        $stmt->bindValue(':search', "%$search%");
    }
    $stmt->execute();

    return (int) $stmt->fetchColumn();
}

function getModuleOrderField($field) {
    $fields = [
        "id_module" => "m.id_module",
        "name" => "m.name",
        "description" => "m.description",
        "img" => "m.img",
        "url" => "m.url"
    ];

    return $fields[$field] ?? "m.id_module";
}

function getModuleSearchField($field) {
    $fields = [
        "name" => "m.name",
        "description" => "m.description",
        "img" => "m.img",
        "url" => "m.url"
    ];

    return $fields[$field] ?? "all";
}

function getModuleById($id_module) {
    global $db;
    try {
        $query = "SELECT id_module AS id, name, description, img, url
                  FROM modules
                  WHERE id_module = :id_module";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_module', $id_module, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveModule($name, $description, $img, $url) {
    global $db;
    try {
        $query = "INSERT INTO modules (name, description, img, url)
                  VALUES (:name, :description, :img, :url)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':img', $img);
        $stmt->bindParam(':url', $url);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function updateModule($id_module, $name, $description, $img, $url) {
    global $db;
    try {
        $query = "UPDATE modules
                  SET name = :name,
                      description = :description,
                      img = :img,
                      url = :url
                  WHERE id_module = :id_module";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_module', $id_module, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':img', $img);
        $stmt->bindParam(':url', $url);
        $stmt->execute();
        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function deleteModule($id_module) {
    global $db;
    try {
        $query = "DELETE FROM modules WHERE id_module = :id_module";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_module', $id_module, PDO::PARAM_INT);
        $stmt->execute();
        return ['success' => true];
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

function getModuleOptions() {
    global $db;
    try {
        $query = "SELECT id_module AS id, name
                  FROM modules
                  ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// Recuperar una acción por ID
function getActionById($id) {
    global $db;
    try {
        $query = "SELECT id_action AS id,
                         name,
                         description,
                         id_module
                  FROM actions
                  WHERE id_action = :id_action";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_action', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveActions($name, $description, $id_module) {
    global $db;
    try {
        $query = "INSERT INTO actions (name, description, id_module)
                  VALUES (:name, :description, :id_module)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':id_module', $id_module, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function updateActions($id, $name, $description, $id_module) {
    global $db;
    try {
        $query = "UPDATE actions
                  SET name = :name,
                      description = :description,
                      id_module = :id_module
                  WHERE id_action = :id_action";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_action', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':id_module', $id_module, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// Eliminar acción
function deleteActions($id) {
    global $db;
    try {
        $query = "DELETE FROM actions WHERE id_action = :id_action";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_action', $id, PDO::PARAM_INT);
        $stmt->execute();

        return ['success' => true];
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



