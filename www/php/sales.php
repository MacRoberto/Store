<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllSales($db) {

    $stmt = $db->query("SELECT id_sale, user_id, transaction_date, total_amount, payment_method, status FROM sales");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllSales($db));
?>