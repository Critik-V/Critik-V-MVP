# this is a justfile for running the project

# RUN
dev:
    just run-db && hivemind procfile

run-server:
    cd server && pnpm run start:dev

run-client:
    cd client && pnpm run start

run-pdf-service:
    cd pdf-service && go run main.go

# DATABASE
run-db:
    docker compose --file docker/docker-compose-db.yml up -d

stop-db:
    docker compose -f docker/docker-compose-db.yml down

# TEST
test-client:
    cd client && pnpm run test

test-server:
    cd server && pnpm run test

test-pdf-service:
    cd pdf-service && go test ./...

# lint
lint-client:
    cd client && pnpm run lint

lint-server:
    cd server && pnpm run lint

# install dependencies
add-server pkg:
    cd server && pnpm add {{pkg}}
    
add-client pkg:
    cd client && pnpm add {{pkg}}
