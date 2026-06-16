<?php
require_once 'lib/db.php';
require_once 'lib/functions.php';

function getAllActions($db) {
    $stmt = $db->query("SELECT id_action, name, description, id_module FROM actions");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

jsonResponse(getAllActions($db));
?>