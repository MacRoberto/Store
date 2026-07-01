<?php
require_once __DIR__ . '/../lib/db.php';

if (!function_exists('getAllUsers')) {
    function getAllUsers() {
        global $db;
        try {
            $stmt = $db->prepare(
                "SELECT u.id_user, u.username, u.id_rol, u.status, r.name AS role_name
                 FROM users u
                 LEFT JOIN roles r ON u.id_rol = r.id_rol
                 ORDER BY u.id_user ASC"
            );
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
}

function createUser($data) {
    global $db;
    try {
        $username = trim($data['username'] ?? '');
        $id_rol = (int)($data['id_rol'] ?? 0);
        $status = $data['status'] ?? 'Active';

        if ($username === '' || $id_rol <= 0) {
            return ['status' => 'error', 'message' => 'Datos inválidos para crear el usuario.'];
        }

        $stmt = $db->prepare(
            "INSERT INTO users (username, id_rol, status, password_hash)
             VALUES (:username, :id_rol, :status, :password_hash)"
        );
        $stmt->execute([
            ':username' => $username,
            ':id_rol' => $id_rol,
            ':status' => $status,
            ':password_hash' => ''
        ]);

        return ['status' => 'success', 'message' => 'Usuario registrado correctamente.'];
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Error al guardar: ' . $e->getMessage()];
    }
}

function processUser($data) {
    return createUser($data);
}

function updateUser($data) {
    global $db;
    try {
        $id_user = (int)($data['id_user'] ?? 0);
        $username = trim($data['username'] ?? '');
        $id_rol = (int)($data['id_rol'] ?? 0);
        $status = $data['status'] ?? 'Active';

        if ($id_user <= 0 || $username === '' || $id_rol <= 0) {
            return ['status' => 'error', 'message' => 'Datos inválidos para actualizar el usuario.'];
        }

        $stmt = $db->prepare(
            "UPDATE users
             SET username = :username, id_rol = :id_rol, status = :status
             WHERE id_user = :id_user"
        );
        $stmt->execute([
            ':username' => $username,
            ':id_rol' => $id_rol,
            ':status' => $status,
            ':id_user' => $id_user
        ]);

        return ['status' => 'success', 'message' => 'Usuario actualizado correctamente.'];
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Error al actualizar: ' . $e->getMessage()];
    }
}

function deleteUser($id_user) {
    global $db;
    try {
        $id_user = (int)$id_user;
        if ($id_user <= 0) {
            return ['status' => 'error', 'message' => 'ID de usuario inválido.'];
        }

        $stmt = $db->prepare("DELETE FROM users WHERE id_user = :id_user");
        $stmt->execute([':id_user' => $id_user]);

        return ['status' => 'success', 'message' => 'Usuario eliminado correctamente.'];
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => 'Error al eliminar: ' . $e->getMessage()];
    }
}
?>