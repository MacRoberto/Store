<?php
require_once 'lib/functions.php';

$_post = json_decode(file_get_contents('php://input'), true);
$action = $_post['action'] ?? '';
$email = $_post['email'] ?? '';
$password = $_post['password'] ?? '';

$data = "";
switch ($action) {
  case 'login':
    $data = login($email, $password);
    break;
  default:
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
    break;
}

if ($data) {
  echo json_encode(['status' => 'success', 'data' => $data]);
} else {
  echo json_encode(['status' => 'error', 'message' => 'Failed to fetch data']);
}