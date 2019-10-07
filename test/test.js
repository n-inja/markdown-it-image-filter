'use strict'

const MarkdownIt = require('markdown-it')
const md = new MarkdownIt()
const assert = require('assert')
const filter = require('../')

md.use(filter(['ok.example.com']))

describe('simple', function() {
  it('ok', function() {
    const s = '![](https://ok.example.com/image.png)'
    assert.equal('<p><img src="https://ok.example.com/image.png" alt=""></p>\n', md.render(s))
  })
  it('ng', function() {
    const s = '![](https://ng.example.com/image.png)'
    assert.equal('<p>!<a href="https://ng.example.com/image.png"></a></p>\n', md.render(s))
  })
})

const md2 = new MarkdownIt()
md2.use(filter(['ok.example.com'], {httpsOnly: true}))

describe('option', function() {
  it('ok', function() {
    const s = '![](ok.example.com/image.png)'
    assert.equal('<p>!<a href="ok.example.com/image.png"></a></p>\n', md2.render(s))
  })
  it('ng', function() {
    const s = '![](http://ok.example.com/image.png)'
    assert.equal('<p>!<a href="http://ok.example.com/image.png"></a></p>\n', md2.render(s))
  })
})
