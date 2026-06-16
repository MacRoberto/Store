<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllProducts($db) {

    $stmt = $db->query("SELECT id_product, barcode, name, category_id, description, reorder_level, status, unit FROM products");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllProducts($db));
?>