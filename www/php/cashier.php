<?php
require_once "../src/functions.php";

header("Content-Type: application/json; charset=utf-8");

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $data['action'] ?? '';

if ($action === 'find') {
    $query = trim($data['query'] ?? '');

    if ($query === '') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Debes escribir un código o nombre de producto'
        ]);
        exit;
    }

    try {
        global $db;

        $sql = "
            SELECT
                p.id_product AS id,
                p.product_name AS name,
                p.barcode AS barcode,
                COALESCE(
                    (
                        SELECT ii.sale_price
                        FROM inventory_items ii
                        WHERE ii.product_id = p.id_product
                        ORDER BY ii.id_inventory_item DESC
                        LIMIT 1
                    ),
                    0
                ) AS price
            FROM products p
            WHERE p.barcode = :query
               OR p.product_name LIKE :like_query
            ORDER BY p.id_product DESC
            LIMIT 1
        ";

        $stmt = $db->prepare($sql);
        $stmt->bindValue(':query', $query);
        $stmt->bindValue(':like_query', '%' . $query . '%');
        $stmt->execute();

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            echo json_encode([
                'status' => 'success',
                'product' => [
                    'id' => (int)$product['id'],
                    'name' => $product['name'],
                    'barcode' => $product['barcode'],
                    'price' => (float)$product['price']
                ]
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Producto no encontrado'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error en el servidor: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Action invalid'
    ]);
}
?>