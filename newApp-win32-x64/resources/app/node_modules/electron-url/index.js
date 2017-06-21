//Import dependencies
var path = require('path');

//Pattern
var pattern = path.join('file://' + __dirname, './{file}');

//Load an url
module.exports.load = function(win, rep)
{
  //Check the replace options
  if(typeof rep !== 'object'){ var rep = {}; }

  //Initialize the file url
  var file = '' + pattern;

  //Replace in the url pattern
  for(var key in rep)
  {
    //Get the regexp
    var reg = new RegExp('{' + key + '}', 'g');

    //Get the replace value
    var value = rep[key];

    //Replace
    file = file.replace(reg, value);
  }

  //Load the url
  win.loadURL(file);
};

//Set the pattern url
module.exports.pattern = function(value)
{
  //Save the pattern
  pattern = value;
};