<?php
@session_start();
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
            a.id_module,
            a.permission_key
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

function findProductBybarcode($barcode){
    global $db;

    $sql = "
        SELECT
        p.id_product AS id,
        p.name AS name,
        p.barcode AS barcode,
        ii.id_inventory_item AS inventory_item_id,
        COALESCE(ii.sale_price, 0) AS price,
        categories.name as category_name
    FROM products AS p
    INNER JOIN categories on p.category_id = categories.id_cat 
    LEFT JOIN inventory_items AS ii
        ON ii.id_inventory_item = (
            SELECT ii2.id_inventory_item
            FROM inventory_items AS ii2
            WHERE ii2.product_id = p.id_product
            ORDER BY ii2.id_inventory_item DESC
            LIMIT 1
        )
    WHERE p.barcode = :barcode
    LIMIT 1;
    ";

    $stmt = $db->prepare($sql);
    $stmt->bindValue(':barcode', $barcode);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

//consulta para obtener promociones activas de un producto en especifico
function getPromotionsByProductId($productId) {
    global $db;

    $sql = "
        SELECT
        id_promotion,
        name,
        description,
        date_start,
        date_end,
        percent_off,
        id_product,
        status
    FROM promotions
    WHERE id_product = :id_product
        AND status = 'Active'
        AND DATE(CONVERT_TZ(NOW(), '+00:00', '-05:00'))
        BETWEEN date_start AND date_end
    ORDER BY percent_off DESC
    LIMIT 1
    ";

    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id_product', $productId, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
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

/*inicio de Inventory Items

/**
 * Obtiene los artículos de inventario de forma paginada, ordenada y filtrada.
 * Realiza un LEFT JOIN con la tabla de productos para obtener el nombre del producto.
 */
function getAllInventoryItems($data = []) {
    global $db;

    // 1. Configuración de Paginación
    $page = isset($data['page']) ? max(1, intval($data['page'])) : 1;
    $limit = isset($data['limit']) ? intval($data['limit']) : 50;
    $offset = ($page - 1) * $limit;

    // 2. Mapeo de Columnas para Ordenamiento
    $allowedColumns = [
        'id_inventory_item' => 'ii.id_inventory_item',
        'product_name'      => 'p.name',
        'cost_price'        => 'ii.cost_price',
        'sale_price'        => 'ii.sale_price',
        'quantity_received' => 'ii.quantity_received',
        'quantity_available' => 'ii.quantity_available',
        'status'            => 'ii.status'
    ];

    $reqOrder = $data['orderBy'] ?? 'id_inventory_item';
    $orderBy = $allowedColumns[$reqOrder] ?? 'ii.id_inventory_item';
    $orderDirection = (isset($data['orderDirection']) && strtoupper($data['orderDirection']) === 'ASC') ? 'ASC' : 'DESC';

    // 3. Construcción de Filtros Dinámicos
    $whereClauses = ["1=1"];
    $params = [];

    // Filtrar por ID de Inventario padre (usando la columna real id_inventory)
    $inventoryId = intval($data['inventoryId'] ?? 0);
    if ($inventoryId > 0) {
        $whereClauses[] = "ii.id_inventory = :inventoryId";
        $params[':inventoryId'] = $inventoryId;
    }

    // Filtro dinámico de búsqueda
    $search = trim($data['search'] ?? '');
    $searchField = $data['searchField'] ?? 'all';

    if (!empty($search)) {
        if ($searchField === 'product_name') {
            $whereClauses[] = "p.name LIKE :search";
        } else if ($searchField === 'status') {
            $whereClauses[] = "ii.status LIKE :search";
        } else {
            // Búsqueda por defecto en todos los campos clave
            $whereClauses[] = "(p.name LIKE :search OR ii.id_inventory_item LIKE :search OR ii.status LIKE :search)";
        }
        $params[':search'] = "%$search%";
    }

    $whereSql = implode(" AND ", $whereClauses);

    // 4. Conteo Total de Registros Coincidentes
    $countSql = "SELECT COUNT(*) 
                 FROM inventory_items ii 
                 LEFT JOIN products p ON ii.product_id = p.id_product 
                 WHERE $whereSql";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = intval($countStmt->fetchColumn());

    // 5. Consulta Principal de Datos
    // Mapeo directo usando las columnas reales de HeidiSQL: cost_price, id_inventory, etc.
    $sql = "SELECT 
                ii.id_inventory_item,
                ii.id_inventory,
                ii.product_id,
                COALESCE(p.name, '') AS product_name,
                ii.cost_price,
                ii.sale_price,
                ii.quantity_received,
                ii.quantity_available,
                ii.status
            FROM inventory_items ii
            LEFT JOIN products p ON ii.product_id = p.id_product
            WHERE $whereSql
            ORDER BY $orderBy $orderDirection
            LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);

    // Asignar parámetros dinámicos
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Retornar respuesta estructurada para el frontend
    return [
        'records'    => $records,
        'total'      => $total,
        'page'       => $page,
        'limit'      => $limit,
        'totalPages' => ($total > 0) ? ceil($total / $limit) : 0
    ];
}

//fin de inventory items

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

/**
 * Obtiene el listado paginado, filtrado y ordenado de inventarios.
 */
function getAllInventories($requestData) {
    global $db;
    try {
        $page = max(1, (int) ($requestData["page"] ?? 1));
        $limit = max(1, (int) ($requestData["limit"] ?? 50));
        $offset = ($page - 1) * $limit;

        $orderBy = getInventoryOrderField(
            $requestData["orderBy"] ?? "id_inv"
        );

        $orderDirection = getOrderDirection(
            $requestData["orderDirection"] ?? "DESC"
        );

        $searchField = getInventorySearchField(
            $requestData["searchField"] ?? "all"
        );

        $search = trim($requestData["search"] ?? "");
        $total = getTotalInventories($searchField, $search);

        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    i.id_inventory LIKE :search
                    OR u.username LIKE :search
                    OR i.arrival_date LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        // Consultamos la tabla de inventarios vinculando los datos de la cuenta de usuario encargada
        $query = "SELECT i.id_inventory, i.user_id, i.arrival_date,
                         u.username AS username
                  FROM inventories i
                  LEFT JOIN users u ON i.user_id = u.id_user
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
/**
 * Valida y asigna el campo por el cual se va a ordenar la tabla de inventarios.
 */
function getInventoryOrderField($field) {
    $allowedFields = [
        'id_inv' => 'i.id_inventory',
        'arrival_date' => 'i.arrival_date',
        'username'     => 'u.username'
    ];
    return $allowedFields[$field] ?? 'i.id_inventory';
}

/**
 * Valida y asigna el campo por el cual se filtrará la búsqueda.
 */
function getInventorySearchField($field) {
    $allowedFields = [
        'id_inv' => 'i.id_inventory',
        'username'     => 'u.username',
        'arrival_date' => 'i.arrival_date'
    ];
    return $allowedFields[$field] ?? 'all';
}

/**
 * Obtiene el total de registros en la tabla inventarios aplicando el filtro de búsqueda.
 */
function getTotalInventories($searchField, $search) {
    global $db;
    try {
        $where = "WHERE 1=1";
        if ($search !== "") {
            if ($searchField === "all") {
                $where .= " AND (
                    i.id_inventory LIKE :search
                    OR u.username LIKE :search
                    OR i.arrival_date LIKE :search
                )";
            } else {
                $where .= " AND $searchField LIKE :search";
            }
        }

        $query = "SELECT COUNT(*) as total 
                  FROM inventories i
                  LEFT JOIN users u ON i.user_id = u.id_user
                  $where";

        $stmt = $db->prepare($query);
        if ($search !== "") {
            $stmt->bindValue(":search", "%$search%");
        }

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($result['total'] ?? 0);
    } catch (PDOException $e) {
        return 0;
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

function updateUsers($id, $username, $id_rol, $status, $password = null) {
    global $db;
    try {
        if ($password !== null && $password !== "") {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

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

        if ($password !== null && $password !== "") {
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

function getAllActions($requestData) {
    global $db;
    try {
        // Ejecutamos un LEFT JOIN para obtener el nombre legible del módulo al que pertenece cada acción
        $query = "SELECT a.id_action, a.name AS action_name, a.description, a.id_module,
                         m.name AS module_name
                  FROM actions a
                  LEFT JOIN modules m ON a.id_module = m.id_module
                  WHERE a.id_module = :id_module
                  ORDER BY m.name ASC, a.id_action ASC";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_module', $requestData['idModule'], PDO::PARAM_INT);
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

//Funcion para recuperar listado de modulos, acciones correspondientes y los permisos que un rol tiene
function getAllRolesPermissions($idRole) {
    global $db;
    try {
        $query = "SELECT m.id_module,
                        m.name AS module_name,
                        m.description AS module_description,
                        m.img,
                        m.url,
                        a.id_action,
                        a.name AS action_name,
                        a.description AS action_description,
                        CASE WHEN rp.id_permission IS NOT NULL THEN 1 ELSE 0 END AS enabled
                FROM modules m
                LEFT JOIN actions a ON a.id_module = m.id_module
                LEFT JOIN role_permissions rp
                    ON rp.id_action = a.id_action
                    AND rp.id_role = :id_role
                    AND rp.status = 'Active'
                ORDER BY m.name ASC, a.name ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_role', $idRole, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $modules = [];
        foreach ($rows as $row) {
            $moduleId = (int) $row['id_module'];

            if (!isset($modules[$moduleId])) {
                $modules[$moduleId] = [
                    'id' => $moduleId,
                    'name' => $row['module_name'],
                    'description' => $row['module_description'],
                    'img' => $row['img'],
                    'url' => $row['url'],
                    'actions' => []
                ];
            }

            if ($row['id_action'] !== null) {
                $modules[$moduleId]['actions'][] = [
                    'id' => (int) $row['id_action'],
                    'name' => $row['action_name'],
                    'description' => $row['action_description'],
                    'enabled' => (bool) $row['enabled']
                ];
            }
        }

        return array_values($modules);
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function saveRolePermissions($roleData)
{
    global $db;

    $permissions = $roleData['permissions'] ?? [];

    try {
        $db->beginTransaction();

        /*
         * Eliminar todos los permisos anteriores del rol.
         */
        $deleteStatement = $db->prepare("
            DELETE FROM role_permissions
            WHERE id_role = :id_role
        ");

        $deleteStatement->execute([
            ':id_role' => $roleData['idRol']
        ]);

        /*
         * Preparar una sola vez la consulta de inserción.
         */
        $insertStatement = $db->prepare("
            INSERT INTO role_permissions (
                id_role,
                id_action,
                status
            ) VALUES (
                :id_role,
                :id_action,
                'Active'
            )
        ");

        $processedActions = [];

        foreach ($permissions as $permission) {

            $idAction = isset($permission['id_action'])
                ? (int) $permission['id_action']
                : 0;

            /*
             * Evitar insertar dos veces la misma acción si el frontend
             * accidentalmente la envía duplicada.
             */
            if (isset($processedActions[$idAction])) {
                continue;
            }

            $insertStatement->execute([
                ':id_role'   => $roleData['idRol'],
                ':id_action' => $idAction
            ]);

            $processedActions[$idAction] = true;
        }

        $db->commit();

        return [
            'success' => "Permisos guardados correctamente"
        ];
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }

        return [
            'error' => "No fue posible guardar los permisos del rol."
        ];
    }
}

//Inicio de funciones para el dashboard

/**
 * Fetches summary counts and sales totals for today.
 */
function getDashboardSummary() {
    global $db;

    // Today's total sales sum
    $stmtSales = $db->prepare("
        SELECT COALESCE(SUM(total_amount), 0) AS todays_sales
        FROM sales
        WHERE DATE(transaction_date) = DATE(
            CONVERT_TZ(NOW(), '+00:00', '-05:00')
        );
    ");
    $stmtSales->execute();
    $todaysSales = $stmtSales->fetch(PDO::FETCH_ASSOC)['todays_sales'] ?? 0;

    // consulta de cantidad de ventas realizadas hoy
    $stmtQtySales = $db->prepare("
        SELECT COUNT(*) AS quantity_sales
        FROM sales
        WHERE DATE(transaction_date) = DATE(
            CONVERT_TZ(NOW(), '+00:00', '-05:00')
        );
    ");
    $stmtQtySales->execute();
    $qtySales = $stmtQtySales->fetch(PDO::FETCH_ASSOC)['quantity_sales'] ?? 0;

    // Out of stock items count
    // consulta para contar la cantidad de productos que están fuera de stock
    $stmtOutOfStock = $db->prepare("
        SELECT COUNT(*) AS out_of_stock
        FROM (
            SELECT
                p.id_product,
                COALESCE(SUM(ii.quantity_available), 0) AS available_quantity
            FROM products AS p
            LEFT JOIN inventory_items AS ii
                ON ii.product_id = p.id_product
            GROUP BY p.id_product
            HAVING available_quantity <= 0
        ) AS stock;
    ");
    $stmtOutOfStock->execute();
    $outOfStock = $stmtOutOfStock->fetch(PDO::FETCH_ASSOC)['out_of_stock'] ?? 0;

    // Active promotions count
    //consulta para contar la cantidad de promociones activas
    $stmtPromotions = $db->prepare("
        SELECT COUNT(*) AS active_promotions
        FROM promotions
        WHERE status = 'Active'
        AND DATE(CONVERT_TZ(NOW(), '+00:00', '-05:00'))
            BETWEEN date_start AND date_end;
    ");
    $stmtPromotions->execute();
    $activePromotions = $stmtPromotions->fetch(PDO::FETCH_ASSOC)['active_promotions'] ?? 0;

    return [
        'todaySales'      => (float)$todaysSales,
        'qtySales'         => (int)$qtySales, //qty = quantity
        'outOfStockItems'  => (int)$outOfStock,
        'activePromotions' => (int)$activePromotions
    ];
}

/**
 * Fetches sales trend aggregated by timeframe ($period = 'week', 'month', 'year').
 * Fetchs o informacion de ventas agregadas por periodo de tiempo ($period = 'week', 'month', 'year').
 */
function getSalesTrendData(string $period = 'week'): array {
    global $db;
    $tz = new DateTimeZone('-05:00'); // Consistent target timezone
    $now = new DateTime('now', $tz);

    switch ($period) {
        case 'month':
            // Current month bounds
            $startDate = (new DateTime('first day of this month 00:00:00', $tz));
            $endDate   = (new DateTime('last day of this month 23:59:59', $tz));

            $query = "
                SELECT 
                    DATE(CONVERT_TZ(transaction_date, '+00:00', '-05:00')) AS date_key,
                    DATE_FORMAT(CONVERT_TZ(transaction_date, '+00:00', '-05:00'), '%Y-%m-%d') AS label,
                    COALESCE(SUM(total_amount), 0) AS total
                FROM sales
                WHERE transaction_date >= :startUTC AND transaction_date <= :endUTC
                GROUP BY date_key, label
                ORDER BY date_key ASC
            ";
            break;

        case 'year':
            // Current year bounds
            $startDate = (new DateTime('first day of January this year 00:00:00', $tz));
            $endDate   = (new DateTime('last day of December this year 23:59:59', $tz));

            $query = "
                SELECT 
                    MONTH(CONVERT_TZ(transaction_date, '+00:00', '-05:00')) AS month_num,
                    DATE_FORMAT(CONVERT_TZ(transaction_date, '+00:00', '-05:00'), '%b') AS label,
                    COALESCE(SUM(total_amount), 0) AS total
                FROM sales
                WHERE transaction_date >= :startUTC AND transaction_date <= :endUTC
                GROUP BY month_num, label
                ORDER BY month_num ASC
            ";
            break;

        case 'week':
        default:
            // Last 7 days
            $startDate = (new DateTime('-6 days 00:00:00', $tz));
            $endDate   = (new DateTime('today 23:59:59', $tz));

            $query = "
                SELECT 
                    DATE(CONVERT_TZ(transaction_date, '+00:00', '-05:00')) AS date_key,
                    DATE_FORMAT(CONVERT_TZ(transaction_date, '+00:00', '-05:00'), '%a') AS label,
                    COALESCE(SUM(total_amount), 0) AS total
                FROM sales
                WHERE transaction_date >= :startUTC AND transaction_date <= :endUTC
                GROUP BY date_key, label
                ORDER BY date_key ASC
            ";
            break;
    }

    // Convert boundaries to UTC strings for DB query filtering
    $utcTz = new DateTimeZone('UTC');
    $startUTC = (clone $startDate)->setTimezone($utcTz)->format('Y-m-d H:i:s');
    $endUTC   = (clone $endDate)->setTimezone($utcTz)->format('Y-m-d H:i:s');

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':startUTC' => $startUTC,
        ':endUTC'   => $endUTC
    ]);
    
    $rawResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map DB results for quick lookup
    $dbData = [];
    foreach ($rawResults as $row) {
        $dbData[$row['label']] = (float)$row['total'];
    }

    // Fill missing time slots with 0 values to maintain unbroken chart series
    return buildContinuousDataset($period, $startDate, $endDate, $dbData, $tz);
}

/**
 * Ensures all periods (days/months) have values in the final dataset.
 */
function buildContinuousDataset(string $period, DateTime $startDate, DateTime $endDate, array $dbData, DateTimeZone $tz): array {
    $dataset = [];
    $current = clone $startDate;

    if ($period === 'year') {
        while ($current <= $endDate) {
            $label = $current->format('M');
            $dataset[] = [
                'label' => $label,
                'total' => $dbData[$label] ?? 0.0,
                'date'  => $current->format('Y-m-d')
            ];
            $current->modify('+1 month');
        }
    } else {
        $labelFormat = ($period === 'month') ? 'Y-m-d' : 'D';
        while ($current <= $endDate) {
            $label = $current->format($labelFormat);
            $dataset[] = [
                'label' => $label,
                'total' => $dbData[$label] ?? 0.0,
                'date'  => $current->format('Y-m-d')
            ];
            $current->modify('+1 day');
        }
    }

    return $dataset;
}

/**
 * Fetches top 4 selling products for the current month.
 */
function getTopSellingProducts() {
    global $db;

    $stmt = $db->prepare("
        SELECT products.id_product, products.`name` as product_name, SUM(sales_details.quantity) AS units_sold FROM products 
        INNER JOIN inventory_items ON products.id_product = inventory_items.product_id
        INNER JOIN sales_details ON sales_details.id_inventory_item = inventory_items.id_inventory_item
        INNER JOIN sales ON sales.id_sale = sales_details.sale_id
        WHERE MONTH(sales.transaction_date) = MONTH(CURDATE()) 
          AND YEAR(sales.transaction_date) = YEAR(CURDATE())
        GROUP BY products.id_product, products.name
        ORDER BY units_sold DESC
        LIMIT 5
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Fetches recent sales transactions.
 */
function getRecentTransactions() {
    global $db;

    $stmt = $db->prepare("
       SELECT sum(sales_details.quantity) AS qty, 
         DATE_FORMAT(transaction_date, '%Y-%m-%d %H:%i:%s') AS time, 
               total_amount 
        FROM sales 
        JOIN sales_details ON sales.id_sale = sales_details.sale_id
        GROUP BY time, total_amount 
        ORDER BY time DESC
        LIMIT 5
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

//Inicio de funciones para alertas del sistema
function getSystemAlerts() {
    global $db;

    $alerts = [];

    // Check for low inventory stock items
    $stmt = $db->prepare("
        SELECT
            p.name AS product_name,
            COALESCE(SUM(ii.quantity_available), 0) AS quantity
        FROM products AS p
        LEFT JOIN inventory_items AS ii
            ON ii.product_id = p.id_product
        GROUP BY
            p.id_product,
            p.name
        HAVING quantity <= 5
        ORDER BY quantity ASC
        LIMIT 3;
    ");
    $stmt->execute();
    $lowStockItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($lowStockItems as $item) {
        $alerts[] = [
            'type'    => 'inventory_low',
            'title'   => 'Inventory Low',
            'message' => "{$item['product_name']} has reached minimum stock ({$item['quantity']} remaining)."
        ];
    }

    return $alerts;
}
//Fin de funciones para alertas del sistema

//Fin de funciones para el dashboard

//Inicio de funciones para inventarios

/**
 * Saves a new inventory transaction, inventory item, and stock movement.
 *
 * @param array $datas
 * @return array
 */
function saveInventory($datas)
{
    global $db;
    $userId = $_SESSION['user']['id_user'] ?? 0;

    try {
        $db->beginTransaction();

        /*
         * 1. Insert into inventory (Header / Main table)
         */
        $insertInventoryStatement = $db->prepare("
            INSERT INTO inventories (
                user_id,
                arrival_date
            ) VALUES (
                :id_user,
                NOW()
            )
        ");

        $insertInventoryStatement->execute([
            ':id_user' => $userId ?? 1
        ]);

        $idInventory = $db->lastInsertId();

        /*
         * 3. Insert into inventory_movements (Audit / History table)
         */
        foreach ($datas as $item) {
            /*
            * 2. Insert into inventory_items (Detail table)
            */
            $insertItemStatement = $db->prepare("
                INSERT INTO inventory_items (
                    id_inventory,
                    product_id,
                    quantity_received,
                    quantity_available,
                    cost_price,
                    sale_price,
                    status
                ) VALUES (
                    :id_inventory,
                    :product_id,
                    :quantity_received,
                    :quantity_available,
                    :cost_price,
                    :sale_price,
                    'Active'
                )
            ");

            $insertItemStatement->execute([
                ':id_inventory'    => $idInventory,
                ':product_id'      => $item['id'] ?? 0,
                ':quantity_available' => $item['quantity'] ?? 0,
                ':quantity_received' => $item['quantity'] ?? 0,
                ':cost_price'      => $item['cost_price'] ?? 0.00,
                ':sale_price'   => $item['selling_price'] ?? 0.00
            ]);

            $idInventoryItem = $db->lastInsertId();
            
            $insertMovementStatement = $db->prepare("
                INSERT INTO inventory_movements (
                    id_inventory_item,
                    movement_type,
                    user_id,
                    quantity,
                    movement_date,
                    notes
                ) VALUES (
                    :id_inventory_item,
                    'Entry',
                    :user_id,
                    :quantity,
                    NOW(),
                    :notes
                )
            ");

            $insertMovementStatement->execute([
                ':id_inventory_item' => $idInventoryItem,
                ':user_id'           => $userId,
                ':quantity'          => $item['quantity'] ?? 0,
                ':notes'             => $item['notes'] ?? 'Initial stock registration'
            ]);
        }

        $db->commit();

        return [
            'success'          => true,
            'message'          => 'Inventory saved successfully across all tables.',
            'id_inventory'      => $idInventory
        ];

    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }

        return [
            'error'   => 'Could not save inventory transaction.',
            'details' => $error->getMessage()
        ];
    }
}

///Fin de funciones para inventarios

//Inicio de funciones para ventas
function saveSale($data)
{
    global $db;
    $products = $data['products'] ?? [];
    $paymentMethod = str_replace('_',' ',$data['payment_method'] ?? 'cash');
    try {
        $db->beginTransaction();

        /*
         * Registrar encabezado de la venta
         */
        $saleStatement = $db->prepare("
            INSERT INTO sales (
                user_id,
                transaction_date,
                total_amount,
                payment_method,
                status
            ) VALUES (
                :user_id,
                NOW(),
                :total_amount,
                :payment_method,
                'Completed'
            )
        ");

        $saleStatement->execute([
            ':user_id' => $data['user_id'] ?? 0,
            ':total_amount' => $data['total_amount'] ?? 0,
            ':payment_method' => $paymentMethod,
        ]);

        $saleId = (int) $db->lastInsertId();

        /*
         * Preparar una sola vez el INSERT de los detalles
         */
        $detailStatement = $db->prepare("
            INSERT INTO sales_details (
                sale_id,
                quantity,
                unit_price,
                discount_applied,
                subtotal,
                id_inventory_item,
                id_promotion
            ) VALUES (
                :sale_id,
                :quantity,
                :unit_price,
                :discount_applied,
                :subtotal,
                :id_inventory_item,
                :id_promotion
            )
        ");

        foreach ($products as $product) {

            $detailStatement->execute([
                ':sale_id' => $saleId,
                ':quantity' => $product['quantity'] ?? 0,
                ':unit_price' => $product['unit_price'] ?? 0.00,
                ':discount_applied' => $product['discount_applied'] ?? 0.00,
                ':subtotal' => $product['subtotal'] ?? 0.00,
                ':id_inventory_item' => $product['inventory_item_id'] ?? 0,
                ':id_promotion' => $product['id_promotion'] ?? null
            ]);
        }

        $db->commit();

        return array(
            'success' => true,
            'message' => 'Sale saved successfully.',
            'sale_id' => $saleId
        );
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        return [
            'error' => 'Could not save sale transaction.',
            'details' => $error->getMessage()
        ];
    }
}
//Fin de funciones para ventas

?>


