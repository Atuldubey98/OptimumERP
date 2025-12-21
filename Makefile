MONGO_CONTAINER=mongo
MONGO_IMAGE=mongo:7
REPLICA_SET=rs0
MONGO_PORT=27017
MONGO_VOLUME=mongo-data

.PHONY: mongo-up mongo-init mongo-down mongo-logs mongo-shell mongo-reset

mongo-up:
	docker run -d \
		--name $(MONGO_CONTAINER) \
		-p $(MONGO_PORT):27017 \
		-v $(MONGO_VOLUME):/data/db \
		$(MONGO_IMAGE) \
		mongod --replSet $(REPLICA_SET) --bind_ip_all

mongo-init:
	docker exec -it $(MONGO_CONTAINER) mongosh --eval \
		'rs.initiate({_id:"$(REPLICA_SET)",members:[{_id:0,host:"localhost:27017"}]})'

mongo-shell:
	docker exec -it $(MONGO_CONTAINER) mongosh

mongo-logs:
	docker logs -f $(MONGO_CONTAINER)

mongo-down:
	docker stop $(MONGO_CONTAINER) || true
	docker rm $(MONGO_CONTAINER) || true

mongo-reset: mongo-down
	docker volume rm $(MONGO_VOLUME) || true
