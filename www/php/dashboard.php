<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $period = $requestData['period'] ?? "week";

    // Call functions defined in functions.php
    $response = [
        'summary' => getDashboardSummary(),
        'salesTrend' => getSalesTrendData($period),
        'topProducts' => getTopSellingProducts(),
        'recentTransactions' => getRecentTransactions(),
        'systemAlerts'       => getSystemAlerts()
    ];

    echo json_encode($response);
} else {
    echo json_encode([
        'error' => 'Action invalid'
    ]);
}
?>