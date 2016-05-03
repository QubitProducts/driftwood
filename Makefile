BIN = ./node_modules/.bin

.PHONY: bootstrap test-browser test-ci-browser test-watch-browser test lint;

TESTS = $(shell find ./src -type f -name '*-test.js')

test: lint test-node test-browser

test-node:
	@NODE_ENV=test $(BIN)/mocha "src/**/*-test.js"

test-browser:
	@NODE_ENV=test $(BIN)/karma start --single-run

test-ci: lint test-node
	@NODE_ENV=test $(BIN)/karma start karma.conf-ci.js --single-run

test-browser-watch:
	@NODE_ENV=test $(BIN)/karma start

test-node-watch:
	@NODE_ENV=test $(BIN)/mocha -w "src/**/*-test.js"

lint:
	@$(BIN)/standard

bootstrap:
	@npm install