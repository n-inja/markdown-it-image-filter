# markdown-it-image-filter [![Build Status](https://travis-ci.org/n-inja/markdown-it-image-filter.svg?branch=master)](https://travis-ci.org/n-inja/markdown-it-image-filter)
filter image rule by domain

## Usage

```javascript
const md = require('markdown-it')
const filter = require('markdown-it-image-filter')

md.use(filter(['ok.example.com']))

md.render('![](https://ok.example.com/image.png)')
// '<img href="https://ok.example.com/image.png">\n'

md.render('![](https://ng.example.com/image.png)')
// '!<a href="https://ng.example.com/image.png"></a>'
```

