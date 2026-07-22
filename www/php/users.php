<?php
require_once "../src/functions.php";

// Se reciben los parámetros raw del JSON payload
$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");
if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $list = getAllUsers();
    
    // Regresa la información solicitada
    echo json_encode($list);

} elseif ($accion == "login") {
    $email = $_get['email'] ?? '';
    $password = $_get['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email o contraseña vacíos'
        ]);
        exit;
    }

    try {
        global $db;
        $stmt = $db->prepare("SELECT id_user, username, password_hash, id_rol, status FROM users WHERE username = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $stored = $user['password_hash'] ?? '';

            $verified = false;
            if (!empty($stored) && password_verify($password, $stored)) {
                $verified = true;
            } elseif ($password === $stored) {
                // Fallback for unhashed passwords (compatibilidad)
                $verified = true;
            }

            if ($verified) {
                unset($user['password_hash']);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Login correcto',
                    'user' => $user
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Credenciales inválidas'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Credenciales inválidas'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error en el servidor: ' . $e->getMessage()
        ]);
    }

} else if ($accion == "selectOptions") {
    echo json_encode(getRoleOptions());

} else if ($accion == "getInfoByID") {
    $id = $_get['id'] ?? "";
    echo json_encode(getUserById($id));

} else if ($accion == "save") {
    $username = $_get['username'] ?? "";
    $id_rol = $_get['id_rol'] ?? "";
    $status = $_get['status'] ?? "";
    $password_hash = $_get['password_hash'] ?? "";

    echo json_encode(saveUsers($username, $id_rol, $status, $password_hash));

} else if ($accion == "update") {
    $id = $_get['id'] ?? "";
    $username = $_get['username'] ?? "";
    $id_rol = $_get['id_rol'] ?? "";
    $status = $_get['status'] ?? "";
    $password_hash = $_get['password_hash'] ?? "";

    echo json_encode(updateUsers($id, $username, $id_rol, $status, $password_hash));
    
} else if ($accion == "delete") {
    $id = $_get['id'] ?? "";
    echo json_encode(deleteUsers($id));

} else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'message' => 'Action invalid'
    ]);
}
?>