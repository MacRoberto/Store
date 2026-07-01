<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllInventoryItems();
    echo json_encode($list);
} 
else if ($accion == "insert") {
    global $db;
    try {
        $query = "INSERT INTO inventory_items (product_id, id_inventory, cost_price, sale_price, quantity_received, quantity_available, status) 
                  VALUES (:product_id, :id_inventory, :cost_price, :sale_price, :quantity_received, :quantity_available, 'Active')";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':product_id', $_get['product_id']);
        $stmt->bindParam(':id_inventory', $_get['id_inventory']);
        $stmt->bindParam(':cost_price', $_get['cost_price']);
        $stmt->bindParam(':sale_price', $_get['sale_price']);
        $stmt->bindParam(':quantity_received', $_get['quantity_received']);
        $stmt->bindParam(':quantity_available', $_get['quantity_available']);
        
        $stmt->execute();
        
        echo json_encode([
            'status' => 'success',
            'msg' => 'Item inserted successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'msg' => $e->getMessage()
        ]);
    }
} 
else if ($accion == "get_products_list") {
    $products = getAllProducts();
    echo json_encode($products);
} 
else if ($accion == "get_inventories_list") {
    $inventories = getAllInventories();
    echo json_encode($inventories);
} 
else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>