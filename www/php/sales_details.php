<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllSales_details($db) {

    $stmt = $db->query("SELECT id_sale_item, sale_id, quantity, unit_price, discount_applied, subtotal, id_inventory_item, id_promotion   FROM sales_details");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllSales_details($db));
?>