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

## Contributing:

Contribute new tasks to yogi-alloy is really easy:

1. [Install Yogi Alloy](https://github.com/eduardolundgren/yogi-alloy#install), if you haven't done it yet.
1. Fork and clone [yogi-alloy](http://github.com/eduardolundgren/yogi-alloy).
2. Replace it with your cloned version, to do that follow the next steps:

	a. Move the old symbolic link form your way:

		mv /usr/local/bin/yogi-alloy /usr/local/bin/yogi-alloy-npm

	b. Create a symbolic link for your cloned version of `yogi-alloy.js`, for example:

		ln -s /Users/you/yogi-alloy/bin/yogi-alloy.js /usr/local/bin/yogi-alloy

3. Copy the contents of the `hello` command located at [hello.js](https://github.com/eduardolundgren/yogi-alloy/blob/master/lib/cmds/hello.js) into `lib/cmds/my-command.js`.
4. Send a pull request with your new command.
5. If the pull gets approved, it will be available in the next version under [npm](https://npmjs.org/package/yogi-alloy).
6. Run your command:

	yogi alloy --my-command