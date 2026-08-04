<?php
session_start();
require_once "../src/functions.php";
require_once __DIR__ . '/validatores/validate-form.php';
$usersRules = require __DIR__. '/validatores/rules/users.php';

// Se reciben los parámetros raw del JSON payload
$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");
if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $list = getAllUsers($requestData);
    
    // Regresa la información solicitada
    echo json_encode($list);

} elseif ($accion == "login") {
    $email = $requestData['email'] ?? '';
    $password = $requestData['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email o contraseña vacíos'
        ]);
        exit;
    }

    try {
        $user = getUserByEmail($email);

        if ($user) {
            $verified = verifyUserPassword(
                $password,
                $user['password_hash'] ?? ''
            );

            if ($verified) {
                unset($user['password_hash']);
                $_SESSION["user"] = [
                    "id_user" => $user["id_user"],
                    "username" => $user["username"],
                    "id_rol" => $user["id_rol"],
                    "status" => $user["status"],
                    "role" => $user["role"],
                    "defaultView" => "dashboard"
                ];

                $permissions = getRolePermissions($user["id_rol"]);
                $_SESSION["user"]['permissions'] = $permissions;
                $modules = getRoleModules($user["id_rol"]);
                $_SESSION["user"]['modules'] = $modules;
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Login correcto',
                    'user' => $_SESSION["user"]
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

} else if ($accion == "getInfoByID") {
    $id = $requestData['id'] ?? "";
    echo json_encode(getUserById($id));

} else if ($accion == "save") {

    $validation = validateForm(
        $requestData,
        $usersRules
    );

    if (!$validation['valid']) {
        echo json_encode(["error" => $validation["error"]['message']]);
        exit; 
    }

    $username = $requestData['username'] ?? "";
    $id_rol = $requestData['id_rol'] ?? "";
    $status = $requestData['status'] ?? "";
    $password = $requestData['password'] ?? "";

    echo json_encode(saveUsers($username, $id_rol, $status, $password));

} else if ($accion == "update") {
        $validation = validateForm(
        $requestData,
        $usersRules
    );

    if (!$validation['valid']) {
        echo json_encode(["error" => $validation["error"]['message']]);
        exit; 
    }

    $id = $requestData['id'] ?? "";
    $username = $requestData['username'] ?? "";
    $id_rol = $requestData['id_rol'] ?? "";
    $status = $requestData['status'] ?? "";
    $password = $requestData['password'] ?? "";

    echo json_encode(updateUsers($id, $username, $id_rol, $status, $password));
    
} else if ($accion == "delete") {
    $id = $requestData['id'] ?? "";
    echo json_encode(deleteUsers($id));
 

}elseif ($accion == "session") {

    if (isset($_SESSION["user"])) {
        echo json_encode([
            "status" => "success",
            "user" => $_SESSION["user"]
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No active session"
        ]);
    }

}elseif ($accion == "logout") {

    session_unset();
    session_destroy();

    echo json_encode([
        "status" => "success",
        "message" => "Session closed"
    ]);
} else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'message' => 'Action invalid'
    ]);
}
?>
