<?php
require_once __DIR__ . "/../src/functions.php";
require_once __DIR__ . "/../src/lib/functions_users.php"; // Archivo modular que vas a crear

$rawInput = file_get_contents("php://input");
$_get = json_decode($rawInput, true);
if (!is_array($_get)) {
    $_get = $_REQUEST;
}
$accion = $_get['action'] ?? "";

if ($db === null) {
    echo json_encode(['status' => 'error', 'message' => 'No hay conexión a la base de datos.']);
    exit;
}

header("Content-Type: application/json");

switch ($accion) {
    case "list":
        $list = getAllUsers();
        echo json_encode($list);
        break;

    case "create":
        $resultado = createUser($_get);
        echo json_encode($resultado);
        break;

    case "update":
        $resultado = updateUser($_get);
        echo json_encode($resultado);
        break;

    case "delete":
        $id_user = $_get['id_user'] ?? 0;
        $resultado = deleteUser($id_user);
        echo json_encode($resultado);
        break;

    case "login":
        $email = $_get['email'] ?? '';
        $password = $_get['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Email o contraseña vacíos']);
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
                    $verified = true;
                }

                if ($verified) {
                    unset($user['password_hash']);
                    echo json_encode(['status' => 'success', 'message' => 'Login correcto', 'user' => $user]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Action invalid']);
        break;
}
?>