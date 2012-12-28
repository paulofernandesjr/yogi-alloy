# yogi alloy

This project provides common [AlloyUI](http://alloyui.com) tasks for [yogi](http://yui.github.com/yogi) command line tool.

## Usage

	yogi alloy [command]

## Install

	npm -g install yogi
	npm -g install yogi-alloy

## Available commands:

### 1) Alloy Twitter Bootstrap

Provides a set of util commands to work with [Alloy Twitter Bootstrap](http://github.com/eduardolundgren/alloy-twitter-bootstrap) project.

Compile SASS files to CSS.

	yogi alloy --compile-css

Watch changes on SASS files and build them.

	yogi alloy --watch-css

### 2) Namespace

Finds all CSS files in the current directory (non-recursively) and namespace them.

	yogi alloy --namespace-css [yourNamespace]

For example:

	yogi alloy --namespace-css foo

Turns `.bar {}` into `.foo-bar {}`.

### 3) Website

Provides a command to run the [alloyui.com](http://github.com/liferay/alloyui.com) website locally.

	yogi alloy --run-site