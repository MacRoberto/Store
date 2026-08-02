<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllProducts($requestData);
    
    echo json_encode($list);
}else if($accion == "delete"){
    $id_producto = $requestData['id']; 
    //llamar funcion para cambiar estatus a inactivo
    $result = softDeleteProduct($id_producto);
    echo json_encode($result);
}else if($accion == "save") {
    $barcode = $requestData['barcode'] ?? "";
    $name = $requestData['name'] ?? "";
    $category_id = $requestData['category'] ?? 0;
    $description = $requestData['description'] ?? "";
    $reorder_level = $requestData['reorder_level'] ?? "";
    $status = $requestData['status'] ?? "";
    $units = $requestData['units'] ?? "";

    //llamar funcion para guardar producto
    $result = saveProduct($barcode, $name, $category_id, $description, $reorder_level, $status, $units);
    
    echo json_encode($result);
}else if($accion == "getInfoByID") {
    $id_producto = $requestData['id'] ?? "";
    //llamar funcion para recuperar la informacion especifica del producto
    $result = getProductById($id_producto);
    
    echo json_encode($result);
}else if($accion == "update") {
    $id_producto = $requestData['id'] ?? 0;
    $barcode = $requestData['barcode'] ?? "";
    $name = $requestData['name'] ?? "";
    $category_id = $requestData['category'] ?? "";
    $description = $requestData['description'] ?? "";
    $reorder_level = $requestData['reorder_level'] ?? "";
    $status = $requestData['status'] ?? "";
    $units = $requestData['units'] ?? "";
    
    if (empty($id_producto) || empty($barcode) || empty($name) || empty($category_id) || empty($status)) {
        echo json_encode(["error" => "Required fields cannot be empty."]);
        exit;
    }
    //llamar funcion para actualizar producto
    $result = updateProduct($id_producto, $barcode, $name, $category_id, $description, $reorder_level, $status, $units);

    echo json_encode($result);

    
}else if($accion == "selectOptions"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getProductOptions();
    //regresa la informacion solicitada
    echo json_encode($list);
}else if($accion == "find"){
    $barcode = $requestData['search']; 
    $product = findProductBybarcode($barcode);
    if ($product) {
        echo json_encode([
            'status' => 'success',
            'product' => [
                'id' => (int)$product['id'],
                'name' => $product['name'],
                'barcode' => $product['barcode'],
                'inventory_item_id' => (int)$product['inventory_item_id'],
                'price' => (float)$product['price'],
                'category_name' => $product['category_name']
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Producto no encontrado'
        ]);
    }
}
else {
    echo json_encode([
        'error' => 'Action invalid'
    ]);
}


?>