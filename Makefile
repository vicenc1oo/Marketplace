COMPOSE = docker compose

CERT_DIR = frontend/certs
CERT_KEY = $(CERT_DIR)/localhost.key
CERT_CRT = $(CERT_DIR)/localhost.crt

.PHONY: all certs build up down logs restart clean fclean re

all: up

certs:
	@mkdir -p $(CERT_DIR)
	@if [ ! -f $(CERT_KEY) ] || [ ! -f $(CERT_CRT) ]; then \
		echo "Generating local self-signed HTTPS certificate..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(CERT_KEY) \
			-out $(CERT_CRT) \
			-subj "/CN=localhost"; \
	else \
		echo "HTTPS certificate already exists."; \
	fi

build: certs
	$(COMPOSE) build

up: certs
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

restart: down up

clean:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans

re: fclean up

db-migrate:
 	$(COMPOSE) exec backend npm run db:migrate

db-seed:
 	$(COMPOSE) exec backend npm run db:seed:users
 	$(COMPOSE) exec backend npm run db:seed:categories
 	$(COMPOSE) exec backend npm run db:seed:wallets
 	$(COMPOSE) exec backend npm run db:seed:promotion-packages
 	$(COMPOSE) exec backend npm run db:seed:listings

db-setup: db-migrate db-seed

.PHONY: all certs build up down logs restart clean fclean re db-migrate db-seed db-setup
