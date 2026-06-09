dev:
	docker compose up -d --build

prod:
	docker compose prod

# Commands below operate on the development Compose service.
start:
	docker compose start
	
stop:
	docker compose stop
	
down:
	docker compose down --volumes --remove-orphans && docker image rm flickr-gallery_img && rm -rf app/node_modules app/.quasar

restart:
	docker compose restart

logs:
	docker compose logs
