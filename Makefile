BIN = ./node_modules/.bin

.PHONY: test benchmark benchmark-watch test-node test-browser test-ci test-browser-watch test-node-watch lint bootstrap;

TESTS = $(shell find ./src -type f -name '*-test.js')

test: lint test-node test-browser

benchmark:
	@NODE_ENV=test $(BIN)/karma start karma.benchmark.conf.js --single-run\

benchmark-ci:
	@NODE_ENV=test $(BIN)/karma start karma.benchmark.conf-ci.js --single-run

benchmark-watch:
	@NODE_ENV=test $(BIN)/karma start karma.benchmark.conf.js

test-node:
	@NODE_ENV=test $(BIN)/mocha "src/**/*Tests.js"

test-browser:
	@NODE_ENV=test $(BIN)/karma start --single-run
	@make benchmark

test-ci: test-node
	@NODE_ENV=test $(BIN)/karma start karma.conf-ci.js --single-run
	@make benchmark-ci

test-browser-watch:
	@NODE_ENV=test $(BIN)/karma start

test-node-watch:
	@NODE_ENV=test $(BIN)/mocha -w "src/**/*-test.js"

lint:
	@$(BIN)/standard

bootstrap:
	@npm install