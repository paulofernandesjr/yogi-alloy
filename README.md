# yogi alloy [![NPM version](https://badge.fury.io/js/yogi-alloy.png)](http://badge.fury.io/js/yogi-alloy)

![Pixel Alloy](http://cl.ly/image/110y3s2w2n1l/yogi.jpg)

> This project provides common [AlloyUI](http://alloyui.com) tasks for [yogi](http://yui.github.com/yogi)
command line tool.

## Table of contents

* [Usage](#usage)
* [Dependencies](#dependencies)
* [Install](#install)
* [Available commands](#available-commands)
    * [AlloyUI](#alloyui)
    * [Alloy Bootstrap](#alloy-bootstrap)
    * [AlloyUI.com](#alloyuicom)
    * [API Docs](#api-docs)
* [Contributing](#contributing)
* [History](#history)

## Usage

	ya [command] [--flags]

## Dependencies

In order to sucessfully run all yogi alloy commands you **must** have the following
dependencies installed:

1. [Node.js v0.8](http://nodejs.org/dist/v0.8.2/)
2. [Compass](http://compass-style.org/install/)

## Install

	npm -g install yogi yogi-alloy yuidocjs docpad shifter

## Available commands

```
ya help
```

### AlloyUI

Provides a set of util commands to work with [AlloyUI](http://github.com/liferay/alloy-ui)
project.

#### Init

* This is the **first command you should run**. It will clone or update all dependencies and also build them using `ya build`.

	```
ya init
	```

#### Build

* Build module(s).

	```
ya build
	```

	If you run this command inside of the root or `src` folder it will build **all
	modules** and copy them to `build` folder. If you run this command inside of a module folder,
	e.g. `src/aui-audio`, it will build only that module and copy it to `build/aui-audio`.

* Build module(s) and watch for any changes.

	```
ya build --watch
	```

* Build module(s) and cache it to make build process faster.

	```
ya build --cache
	```

* Build module(s) and validate its code using JSLint.

	```
ya build --lint
	```

* Build `aui-base` which will update every module dependencies.

	```
ya build --loader
	```

* Build [Alloy Bootstrap](http://github.com/liferay/alloy-bootstrap) project.

	```
ya build --css
	```

	This will generate a `build/aui-css` folder that contains Bootstrap's CSS.

* Build [YUI](http://github.com/liferay/yui3) project.

	```
ya build --yui
	```

	This will build all YUI modules inside of `build` folder.

* Build all modules using all options (`--cache`, `--lint`, `--loader`, `--css`, `--yui`).

	```
ya build --all
	```

	You can also disable one or more options. For example, if you want to disable linting and coverage type: `ya build --all --no-lint --no-coverage`

#### Create

* Create a new module. For example:

    ```
ya create --name foo
    ```

	This will generate a `src/aui-foo` folder containing the module scaffolding.

#### Release

* Release a new version.

	```
ya release
	```

	This will generate a ready-to-release version of AlloyUI inside of a .zip file.

### Alloy Bootstrap

Provides a set of util commands to work with [Alloy Bootstrap](http://github.com/liferay/alloy-bootstrap) project.

* Compile SASS files to CSS.

	```
ya css-compile
	```

* Watch changes on SASS files and build them.

	```
ya css-watch
	```

* Finds all CSS files in the current directory and namespace them. For example:

    ```
ya css-namespace --prefix foo
    ```

    Turns `.bar {}` into `.foo-bar {}`.

* Collect all files recursively and remove `aui-` namespace from CSS rules.

    ```
ya css-namespace-remove --file index.html
    ```

    Turns `<div class="aui-container">` into `<div class="container">`.

### AlloyUI.com

Provides a set of util commands to work with [AlloyUI.com](http://github.com/liferay/alloyui.com)
project.

* Run the website locally and watch for any changes.

	```
ya site-watch
	```

* Deploy the API docs to [alloyui.com/api](http://alloyui.com/api/).

	```
ya site-deploy
	```

	In order to see your changes live at [alloyui.com](http://alloyui.com) you'll
	need a git remote pointing to liferay's repository. You can do that by running
	`git remote add upstream git@github.com:liferay/alloyui.com.git`. Then, when
	you get asked about what remote do you want to deploy, just answer `upstream`.

### API Docs

Provides a set of util commands to work with AlloyUI's [API Docs](http://alloyui.com/api/).

* Run the API Docs locally and watch for any changes.

	```
ya api-watch
	```
	Go to `http://localhost:3000` to see it.

* Build the API Docs locally.

	```
ya api-build
	```
	This command will scan all JavaScript files inside of your current folder to
	generate a documentation on `api` folder. You can also set a specific
	source/destination folder by answering command's questions.

* Deploy the website to alloyui.com.

	```
ya api-deploy
	```

	Make sure to run `ya init` to download all dependencies before running this
	command.

## Contributing

Contribute new tasks to yogi alloy is really easy:

1. [Install yogi alloy](#install) and its [dependencies](#dependencies), if you haven't done it yet.
2. Fork and clone [yogi alloy](http://github.com/liferay/yogi-alloy).
3. Replace it with your cloned version, to do that follow the next steps:

	a) Move the old symbolic link form your way:

	```
mv /usr/local/bin/yogi-alloy /usr/local/bin/yogi-alloy-npm
	```

	b) Create a symbolic link for your cloned version.

	```
ln -s /Users/you/yogi-alloy/bin/yogi-alloy.js /usr/local/bin/yogi-alloy
	```
	> **Note:** Remember to change "you" to your own username.

4. In your clone, copy the contents of the `hello` command to `my-command`:

	```
cp -R lib/cmds/hello.js lib/cmds/my-command.js
	```

5. Start working on it and when you finish, just send a pull request with your new command.
6. If the pull gets approved, it will be available in the next version under [npm](https://npmjs.org/package/yogi-alloy).
7. Run your command:

	```
ya my-command
	```

> **Note:** These instructions works on unix-based systems. If you're on Windows, [check instructions here](https://github.com/liferay/yogi-alloy/wiki/Contributing-(Windows)).

## History

* **v0.0.58** July 9, 2013
	* Fix path parameter overwrite
* **v0.0.57** July 9, 2013
	* Rename AlloyUI API Docs Theme project
* **v0.0.56** July 1, 2013
	* Add options to build task (`--cache`, `--coverage`, `--lint`) and removed `--aui`
* **v0.0.55** June 27, 2013
	* Fix `ya init` build CSS
* **v0.0.54** June 27, 2013
	* Removing unnecessary folder removal, since gh-pages branch is now ignoring it
* **v0.0.53** June 25, 2013
	* Show clone/update status on `ya init` command
* **v0.0.52** June 20, 2013
	* Rename `alloy-twitter-bootstrap` project to `alloy-bootstrap`
* **v0.0.51** June 12, 2013
	* Add `--all`, `--yui`, `--watch` build flags
	* Rename `--js` build flag to `--aui`