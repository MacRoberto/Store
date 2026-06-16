<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllInventoryItems($db) {
    $stmt = $db->query("SELECT id_inventory_item, product_id, id_inventory, cost_price, quantity_received, quantity_avaliable, status, sale_price FROM inventory_items");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllInventoryItems($db));
?>