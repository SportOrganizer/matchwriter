# electron-url 

[![npm](https://img.shields.io/npm/v/electron-url.svg?style=flat-square)](https://www.npmjs.com/package/electron-url)
[![npm](https://img.shields.io/npm/dt/electron-url.svg?style=flat-square)](https://www.npmjs.com/package/electron-url)

A simple way to load a file/url in electron using patterns. 

## Install 

```
npm install --save electron-url
```

## Usage 

```javascript 
//Import dependencies
var electron = require('electron');
var electronUrl = require('electron-url'); 
var path = require('path');

//Import electron modules
var app = electron.app;
var BrowserWindow = electron.BrowserWindow; 

//Initialize the url pattern 
electronUrl.pattern(path.join('file://' + __dirname, './{file}')); 

//Initialize the app 
app.on('ready', function()
{
  //Create the new window
  var mainWindow = new BrowserWindow({ width: 800, height: 600 });

  //More app configuration
  // ....

  //Load the file
  electronUrl.load(mainWindow, { file: 'index.html' });
});
```

## API 

### .load(window, replace) 

Load a file or an url on the `window`. 

#### window 

A `BrowserWindow` object where you want to load the url or file. Read the [electron documentation](http://electron.atom.io/docs/api/browser-window/) for more info.

#### replace

An object where each key will be replaced on the url pattern with the value provided. 

For example, on the following url pattern: 

```
file://{path}/{file}.html
```

If you provide the following replace object: 

```json
{ "path": "my/path", "file": "test" }
```

The following url will be generated: 

``` 
file://my/path/test.html
```

### .pattern(value)

Set the default pattern.

#### value 

A string with the pattern.

## Related 

- [electron-ejs](https://github.com/jmjuanes/electron-ejs): use ejs files in electron.

## License 

[MIT LICENSE](./LICENSE) &copy; Josemi Juanes.
