# Waterline Prana

[Waterline](https://github.com/balderdashy/waterline) adapter for [Prana](https://github.com/recidive/prana).

## Basic usage

```js
var Prana = require('prana');
var Waterline = require('waterline');
var pranaAdapter = require('waterline-prana');

var application = new Prana();

pranaAdapter.setApplication(application);

var config = {
  adapters: {
    'prana': pranaAdapter;
  },
  connections: {
    'my-prana': {
      adapter: 'prana'
    }
  }
};

application.init(function() {
  var waterline = new Waterline();

  waterline.initialize(config, function(error, models) {
    // ...
  });
});
```
