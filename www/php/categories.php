<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllCategories($db) {
    $stmt = $db->query("SELECT id_cat, name, description FROM categories");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllCategories($db));
?>