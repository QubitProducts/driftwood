BIN = ./node_modules/.bin

.PHONY: bootstrap test-browser test-ci-browser test-watch-browser test lint;

TESTS = $(shell find ./src -type f -name '*-test.js')

test: lint
	@NODE_ENV=test $(BIN)/karma start --single-run

test-ci:
	@NODE_ENV=test $(BIN)/karma start karma.conf-ci.js --single-run

test-watch:
	@NODE_ENV=test $(BIN)/karma start

lint:
	@$(BIN)/standard

bootstrap: package.json
	@npm install qubitdigital/deliver-cli
	$(BIN)/deliver install