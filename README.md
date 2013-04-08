# yogi alloy

This project provides common [AlloyUI](http://alloyui.com) tasks for [yogi](http://yui.github.com/yogi) command line tool.

## Usage

	yogi alloy [command]

## Install

	npm -g install yogi yogi-alloy

## Dependencies

In order to sucessfully run all yogi alloy commands you must have the following dependencies installed:

1. [Node.js](http://nodejs.org/download/)
2. [Compass](http://compass-style.org/install/)
3. [DocPad](http://bevry.me/learn/docpad-install)

## Available commands

### AlloyUI

Provides a set of util commands to work with [AlloyUI](http://github.com/liferay/alloy-ui) project.

* Checkout [AlloyUI](https://github.com/liferay/alloy-ui) source code and run the command below to initialize the project and its dependencies. This will generate the `build` folder containting YUI and AlloyUI modules.

	```
yogi alloy --init
	```

* Build components guessing what do build [js, css, js fast].

	```
yogi alloy --build
	```

* Release a new version.

	```
yogi alloy --release
	```

* Finds all CSS files in the current directory and namespace them. For example:

	```
yogi alloy --namespace-css foo
	```

	Turns `.bar {}` into `.foo-bar {}`.

### Alloy Twitter Bootstrap

Provides a set of util commands to work with [Alloy Twitter Bootstrap](http://github.com/liferay/alloy-twitter-bootstrap) project.

* Compile SASS files to CSS.

	```
yogi alloy --compile-css
	```

* Watch changes on SASS files and build them.

	```
yogi alloy --watch-css
	```

### AlloyUI.com

Provides a set of util commands to work with [AlloyUI.com](http://github.com/liferay/alloyui.com) project.

* Run the website locally and watch for any changes.

	```
yogi alloy --site-watch
	```

* Deploy the website to alloyui.com.

	```
yogi alloy --site-deploy
	```

## Contributing

Contribute new tasks to yogi-alloy is really easy:

1. [Install Yogi Alloy](#install), if you haven't done it yet.
2. Fork and clone [yogi-alloy](http://github.com/liferay/yogi-alloy).
3. Replace it with your cloned version, to do that follow the next steps:

	a) Move the old symbolic link form your way:

	```
mv /usr/local/bin/yogi-alloy /usr/local/bin/yogi-alloy-npm
	```

	b) Create a symbolic link for your cloned version of `yogi-alloy.js`, for example:

	```
ln -s /Users/you/yogi-alloy/bin/yogi-alloy.js /usr/local/bin/yogi-alloy
	```

4. In your clone, copy the contents of the `hello` command to `my-command`:

	```
cp -R lib/cmds/hello.js lib/cmds/my-command.js
	```

5. Start working on it and when you finish, just send a pull request with your new command.
6. If the pull gets approved, it will be available in the next version under [npm](https://npmjs.org/package/yogi-alloy).
7. Run your command:

	```
yogi alloy --my-command
	```