<?php
require_once "../src/functions.php";
require_once "../src/mercado_pago.php";

header("Content-Type: application/json; charset=utf-8");

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $data['action'] ?? '';

if ($action === 'pay') {
    @session_start();

    $total_amount_rq = (float) ($data['total_amount'] ?? 0);
    $total_amount_bd = 0;

    foreach ($data['products'] as &$product) {
        $barcode = $product['barcode'];
        $quantity = (int) $product['quantity'];
        $inventory_item_id = (int) $product['inventory_item_id'];

        // Buscar nuevamente el producto en la base de datos
        $db_product = findProductBybarcode($barcode);

        if (!$db_product) {
            echo json_encode([
                'status' => 'error',
                'message' => "Producto con código $barcode no encontrado"
            ]);
            exit;
        }

        // Buscar una promoción activa
        $promotions = getPromotionsByProductId($product['product_id']);

        $promotion = $promotions[0] ?? null;

        $unit_price = (float) $db_product['price'];

        // Subtotal sin descuento
        $subtotal_original = $unit_price * $quantity;

        $id_promotion = null;
        $percent_off = 0;
        $discount_applied = 0;
        if ($promotion) {
            $id_promotion = (int) $promotion['id_promotion'];
            $percent_off = (float) $promotion['percent_off'];

            $discount_applied = $subtotal_original * ($percent_off / 100);
        }

        // Subtotal final después del descuento
        $subtotal = $subtotal_original - $discount_applied;

        $product['unit_price'] = round($unit_price, 2);
        $product['id_inventory_item'] = $inventory_item_id;
        $product['id_promotion'] = $id_promotion;
        $product['percent_off'] = $percent_off;
        $product['discount_applied'] = round($discount_applied, 2);
        $product['subtotal'] = round($subtotal, 2);

        // Acumular total después del descuento
        $total_amount_bd += $subtotal;
    }

    unset($product);

    $total_amount_bd = (float) round($total_amount_bd, 2);

    $total_amount_rq = (float) round($total_amount_rq, 2);

    if ($total_amount_bd !== $total_amount_rq) {
        echo json_encode([
            'status' => 'error',
            'message' =>
            "El total calculado $total_amount_bd no coincide con el total solicitado $total_amount_rq"
        ]);
        exit;
    }

    $result = saveSale([
        'user_id' => $_SESSION['user']['id_user'],
        'total_amount' => $total_amount_bd,
        'payment_method' => $data['payment_method'] ?? 'cash',
        'products' => $data['products'],
        'status' => 'completed'
    ]);
    echo json_encode($result);
} else if ($action === 'create_order') {
    $amount = (float) ($data['total_amount'] ?? 0);

    if ($amount <= 0) {
        echo json_encode([
            'status' => "error",
            'message' => 'El importe no es válido'
        ]);
        exit;
    }

    $result = createMercadoPagoOrder($amount);

    echo json_encode($result);
    exit;
} else if ($action === 'simulate_order') {
    $orderId = trim(
        $data['order_id'] ?? ''
    );

    if ($orderId === '') {
        throw new Exception(
            'No se recibió el ID de la orden.'
        );
    }

    $result = simulateMercadoPagoOrder($orderId);

    echo json_encode($result);
    exit;
} else if ($action === 'get_order') {
    $orderId = trim(
        $data['order_id'] ?? ''
    );

    if ($orderId === '') {
        throw new Exception(
            'No se recibió el ID de la orden.'
        );
    }

    $result = getMercadoPagoOrder(
        $orderId
    );

    echo json_encode($result);
    exit;
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Action invalid'
    ]);
}
