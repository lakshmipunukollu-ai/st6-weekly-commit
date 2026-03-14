export JAVA_HOME := /opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home

.PHONY: dev test seed build clean

dev:
	docker-compose up --build

test:
	cd backend && ./mvnw test -Dspring.profiles.active=test
	cd frontend && npm test -- --run

seed:
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=seed

build:
	cd backend && ./mvnw clean package -DskipTests
	cd frontend && npm run build

clean:
	cd backend && ./mvnw clean
	cd frontend && rm -rf dist node_modules
