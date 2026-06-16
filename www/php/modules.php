<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllModules($db) {
    $stmt = $db->query("SELECT id_module, name, description, img FROM modules");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllModules($db));
?>