<?php

require_once "functions.php";

$_post = json_decode(file_get_contents("php://input"), true);

$email = $_post['email'] ?? "";
$password = $_post['password'] ?? "";

$user = login($email, $password);

if ($user) {
    echo json_encode([
        'status' => 'success',
        'user' => $user
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email or password'
    ]);
}
