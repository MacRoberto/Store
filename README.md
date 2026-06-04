# Stack PHP + MySQL con Docker

Entorno de desarrollo para aplicaciones web con **PHP 8.2**, **Apache**, **MySQL 8.0** y **phpMyAdmin**, todo orquestado con **Docker Compose**.

## Requisitos

Antes de empezar, necesitas tener instalado en tu computadora:

| Software | Versión mínima | Para qué sirve |
|---|---|---|
| **Docker Desktop** | 4.x | Ejecutar los contenedores |
| **Git** (opcional) | 2.x | Control de versiones |

### Instalación de Docker Desktop

1. Ve a [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Descarga la versión para tu sistema operativo (Mac / Windows / Linux)
3. Instálalo como cualquier otro programa
4. Ábrelo y espera a que el motor de Docker arranque (verás el ícono en la barra de menú)
5. Verifica que funciona abriendo una terminal y ejecutando:

```bash
docker --version
# Debe mostrar algo como: Docker version 27.x.x

docker compose version
# Debe mostrar algo como: Docker Compose version v2.x.x
```

## Estructura del proyecto

```
stack-php-mysql/
├── docker-compose.yml       # Orquestación de los servicios
├── Dockerfile               # Configuración de la imagen PHP + Apache
├── Makefile                 # Comandos de uso diario
├── php.ini                  # Configuración de PHP
├── .env                     # Variables de entorno (NO se sube a Git)
├── .env.example             # Plantilla del .env
├── .gitignore               # Archivos que Git debe ignorar
├── README.md                # Este archivo
├── mysql/
│   ├── init.sql             # Script que se ejecuta al crear la BD
│   └── my.cnf               # Configuración adicional de MySQL
└── www/                     # Aquí van tus archivos PHP, CSS, JS
    └── index.php            # Página de bienvenida (punto de entrada)
```

## Primeros pasos

Sigue estos pasos en orden. Si es la primera vez que usas Docker, lee con atención.

### 1. Clonar o descargar el proyecto

```bash
# Si tienes Git:
git clone <url-del-repositorio> stack-php-mysql
cd stack-php-mysql

# Si descargaste el ZIP, simplemente descomprímelo y abre la terminal en esa carpeta.
```

### 2. Configurar variables de entorno

El archivo `.env` contiene los datos de conexión a la base de datos. Ya viene con valores por defecto que puedes cambiar si quieres:

```
MYSQL_ROOT_PASSWORD=root_password   # Contraseña del usuario root de MySQL
MYSQL_DATABASE=app_db                # Nombre de la base de datos
MYSQL_USER=app_user                  # Usuario de la aplicación
MYSQL_PASSWORD=app_password          # Contraseña del usuario
PHP_ENABLE_XDEBUG=0                  # 1 = activar Xdebug, 0 = desactivado
```

> **Importante:** En un proyecto real, **nunca** uses contraseñas tan simples. Esto es solo para desarrollo local.

### 3. Construir las imágenes

Este paso solo se hace la **primera vez** o cuando modifiques el `Dockerfile`.

```bash
make build
```

Esto descargará e instalará:
- PHP 8.2 con Apache
- Todas las extensiones PHP (pdo_mysql, mysqli, gd, mbstring, etc.)
- Composer (gestor de dependencias de PHP)
- MySQL 8.0
- phpMyAdmin

**¿Cuánto tarda?** La primera vez puede tomar de 2 a 10 minutos, dependiendo de tu conexión a internet. Las siguientes veces será casi instantáneo.

### 4. Levantar los servidores

```bash
make up
```

Este comando inicia tres servicios:

| Servicio | Puerto | URL |
|---|---|---|
| **PHP + Apache** | `80` | [http://localhost](http://localhost) |
| **MySQL** | `3306` | `127.0.0.1:3306` |
| **phpMyAdmin** | `8080` | [http://localhost:8080](http://localhost:8080) |

### 5. Verificar que funciona

Abre tu navegador y visita:

- **http://localhost** — Deberías ver una página con el estado del stack, las extensiones de PHP cargadas y los datos de la base de datos.
- **http://localhost:8080** — phpMyAdmin. Inicia sesión con:
  - Usuario: `app_user`
  - Contraseña: `app_password`

### 6. Detener los servidores

Cuando termines de trabajar:

```bash
make down
```

Los datos de la base de datos **se conservan** aunque detengas los contenedores. Viven en un volumen especial de Docker llamado `stack_mysql_data`.

## Cómo trabajar con el proyecto

### Agregar archivos PHP

Todos tus archivos PHP, CSS y JavaScript van dentro de la carpeta `www/`:

```
www/
├── index.php         # Página principal (ya existe)
├── css/
│   └── estilo.css    # Tus estilos
├── js/
│   └── app.js        # Tus scripts
├── images/
│   └── logo.png      # Tus imágenes
└── productos/
    └── listar.php    # Más páginas
```

**No necesitas reiniciar nada.** Los cambios se ven reflejados al instante porque la carpeta `www/` está sincronizada con el contenedor (bind mount).

**Ejemplo: crear una página "Acerca de"**

Crea el archivo `www/acerca.php` con este contenido:

```php
<?php
$titulo = "Acerca de nosotros";
?>
<!DOCTYPE html>
<html>
<head>
    <title><?= $titulo ?></title>
</head>
<body>
    <h1><?= $titulo ?></h1>
    <p>Esta es mi primera página con PHP y Docker.</p>
</body>
</html>
```

Luego visita http://localhost/acerca.php

### Conectarse a MySQL desde PHP

PHP ya tiene todo lo necesario para conectarse a MySQL. El servicio de base de datos se llama `mysql` (así se define en `docker-compose.yml`), por lo tanto desde PHP usas ese nombre como host.

```php
<?php
$host = 'mysql';           // Nombre del servicio en Docker
$db   = 'app_db';          // Nombre de la base de datos
$user = 'app_user';        // Usuario
$pass = 'app_password';    // Contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conectado a MySQL";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

> **Regla de oro:** Dentro de Docker, los contenedores se comunican por el nombre del servicio (`mysql`, `php`). Fuera de Docker (ej. Sequel Ace), usas `127.0.0.1`.

## Conectarse a MySQL desde aplicaciones externas

Puedes conectarte a MySQL desde cualquier cliente como **Sequel Ace**, **Navicat**, **TablePlus**, **DBeaver**, **MySQL Workbench**, etc.

| Campo | Valor |
|---|---|
| **Host** | `127.0.0.1` (o `localhost`) |
| **Puerto** | `3306` |
| **Usuario** | `app_user` |
| **Contraseña** | `app_password` |
| **Base de datos** | `app_db` |

### Ejemplo con Sequel Ace (macOS)

1. Abre Sequel Ace
2. Click en "Add New Connection" (+)
3. Llena los campos:
   - **Name**: Stack PHP MySQL
   - **Host**: `127.0.0.1`
   - **Username**: `app_user`
   - **Password**: `app_password`
   - **Database**: `app_db`
   - **Port**: `3306`
4. Click en "Connect"

Si todo está correcto, verás las tablas `users` y `products`.

## Comandos del Makefile

El `Makefile` tiene atajos para las tareas más comunes. Ejecútalos desde la terminal en la carpeta del proyecto.

| Comando | Qué hace | Cuándo usarlo |
|---|---|---|
| `make up` | Inicia todos los servicios | Para empezar a trabajar |
| `make down` | Detiene todos los servicios | Al terminar la sesión |
| `make restart` | Detiene y vuelve a iniciar | Después de cambiar configuraciones |
| `make build` | Construye/actualiza la imagen de PHP | Primera vez o después de cambiar el Dockerfile |
| `make shell` | Abre una terminal dentro del contenedor PHP | Para ejecutar comandos dentro del servidor |
| `make logs` | Muestra los logs en tiempo real | Para ver errores o depurar |
| `make mysql` | Abre el cliente MySQL dentro del contenedor | Para hacer consultas SQL directas |
| `make ps` | Lista los servicios activos | Para verificar que todo está funcionando |
| `make help` | Muestra todos los comandos disponibles | Si olvidas algún comando |

### Explicación de cada comando

#### `make up`
```bash
make up
# Salida esperada:
# [+] Running 3/3
#  ✔ Container stack-mysql       Started
#  ✔ Container stack-phpmyadmin  Started
#  ✔ Container stack-php         Started
```

#### `make down`
```bash
make down
# Detiene los 3 contenedores. Los datos de MySQL se conservan.
```

#### `make build`
```bash
make build
# Solo necesario la primera vez o cuando modifiques el Dockerfile
# para agregar/quitar extensiones de PHP.
```

#### `make shell`
```bash
make shell
# Entrarás al contenedor PHP. Útil para:
# composer install                    # Instalar dependencias
# php artisan migrate                 # Laravel
# php -v                              # Ver versión de PHP
# exit                                # Salir del contenedor
```

#### `make logs`
```bash
make logs
# Muestra los logs de todos los servicios en tiempo real,
# útil para ver errores de PHP o MySQL.
# Presiona Ctrl+C para salir.
```

#### `make mysql`
```bash
make mysql
# Entrarás al cliente de MySQL. Puedes escribir consultas:
# mysql> SHOW TABLES;
# mysql> SELECT * FROM users;
# mysql> EXIT;
```

## Solución de problemas

### Error "port is already allocated" (puerto en uso)

Significa que ya tienes algo corriendo en el puerto 80 o 3306.

**Posibles causas:**
- Tienes Apache, Nginx o XAMPP instalado y corriendo en tu máquina
- Otro contenedor de Docker está usando el puerto

**Soluciones:**

1. Detén el otro programa (XAMPP, Apache, etc.)
2. O cambia los puertos en `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:80"      # Cambia el puerto 80 por 8081
   ```
   Luego accedes vía http://localhost:8081

### Error "connection refused" desde PHP a MySQL

Suele ocurrir cuando PHP intenta conectarse antes de que MySQL esté listo.

**Solución:** Espera unos segundos y recarga la página. El `docker-compose.yml` ya incluye un `depends_on` con `condition: service_healthy` que evita este problema, pero la primera carga puede tardar un poco.

### Los cambios en archivos no se reflejan

**Posibles causas:**
- El archivo está en la carpeta incorrecta (debe estar dentro de `www/`)
- El navegador tiene caché (prueba con Ctrl+Shift+R o Cmd+Shift+R)
- El contenedor no tiene el bind mount activo (verifica con `docker compose ps`)

### Error de conexión desde Sequel Ace / Navicat

**Verifica:**
1. Que los contenedores estén corriendo (`make ps`)
2. Que el puerto 3306 esté listado en `make ps`
3. Que estés usando `127.0.0.1` y no `localhost` (en algunos sistemas localhost usa sockets en vez de TCP)
4. Que las credenciales coincidan con las del archivo `.env`

## Extensiones PHP incluidas

| Extensión | Propósito |
|---|---|
| `pdo_mysql` | Conexión a MySQL vía PDO |
| `mysqli` | Conexión a MySQL vía mysqli |
| `gd` | Manipulación de imágenes |
| `mbstring` | Soporte para caracteres multi-byte (acentos, ñ, etc.) |
| `exif` | Lectura de metadatos de imágenes |
| `bcmath` | Operaciones matemáticas de precisión arbitraria |
| `zip` | Creación y lectura de archivos ZIP |
| `intl` | Internacionalización (formatos de fecha, moneda, etc.) |
| `opcache` | Aceleración de PHP (caché de opcodes) |
| `xdebug` | Depuración y profiling (desactivado por defecto) |
| `apcu` | Caché de datos en memoria |

## Puertos y URLs

| Servicio | Puerto interno | Puerto en tu máquina | URL |
|---|---|---|---|
| PHP + Apache | 80 | 80 | http://localhost |
| MySQL | 3306 | 3306 | 127.0.0.1:3306 |
| phpMyAdmin | 80 | 8080 | http://localhost:8080 |

## Notas importantes

- **Nunca modifiques archivos dentro del contenedor** usando `make shell`. Siempre edita desde tu máquina (la carpeta `www/`). Los cambios dentro del contenedor se pierden al reconstruirlo.
- **Los datos de MySQL persisten** aunque ejecutes `make down`. Si quieres borrar todo y empezar de cero: `make down` y luego `docker volume rm stack_mysql_data`.
- **No subas el archivo `.env` a Git** (ya está en `.gitignore`). Cada desarrollador tiene su propio `.env` con sus credenciales.
- **Para producción**, este stack necesita ajustes de seguridad (contraseñas seguras, HTTPS, etc.). No es recomendable usar esta configuración tal cual en un servidor público.

## Flujo de trabajo diario

```bash
# 1. Arrancar los servicios
make up

# 2. Verificar que están corriendo
make ps

# 3. Abrir el navegador en http://localhost

# 4. Trabajar normalmente:
#    - Editar archivos en www/
#    - Crear nuevas páginas PHP
#    - Agregar CSS, JavaScript, imágenes

# 5. Si necesitas instalar dependencias PHP:
make shell
composer require alguna-libreria
exit

# 6. Para ver errores en vivo:
make logs
# Ctrl+C para salir

# 7. Para consultar la base de datos:
make mysql

# 8. Al terminar:
make down
```

## Comandos sueltos útiles

```bash
# Ver el estado de todos los contenedores
docker ps -a

# Ver los logs de un servicio específico
docker compose logs php
docker compose logs mysql

# Eliminar el volumen de la BD (¡cuidado! borra todos los datos)
docker volume rm stack_mysql_data

# Reconstruir la imagen de PHP sin caché
docker compose build --no-cache php

# Ejecutar un comando específico sin entrar al contenedor
docker compose exec php php -v
docker compose exec mysql mysql --version
```
