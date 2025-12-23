
all: install-web-deps start-web-dev

install-web-deps:
    cd web && npm install

start-web-dev:
    cd web && npm run dev