include .env
export

.PHONY: up down build restart shell logs mysql ps

up: ## Arriba todos los servicios
	docker compose up -d

down: ## Abajo todos los servicios
	docker compose down

build: ## Construye la imagen de PHP
	docker compose build --no-cache

restart: down up ## Reinicia los servicios

shell: ## Terminal dentro del contenedor PHP
	docker compose exec php bash

logs: ## Logs en tiempo real
	docker compose logs -f

mysql: ## Cliente MySQL dentro del contenedor (pide contraseña)
	docker compose exec mysql mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) $(MYSQL_DATABASE)

ps: ## Lista los servicios activos
	docker compose ps

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'
