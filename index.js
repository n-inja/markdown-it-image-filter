'use strict'

const EXCL = '!'.charCodeAt(0)
const LBRACK = '{'.charCodeAt(0)
const RBRACK = '}'.charCodeAt(0)
const BSLASH = '\\'.charCodeAt(0)
const LBRACE = '['.charCodeAt(0)
const RBRACE = ']'.charCodeAt(0)
const LPAREN = '('.charCodeAt(0)
const RPAREN = ')'.charCodeAt(0)
const DQUOTE = '"'.charCodeAt(0)
const RETURN = '\n'.charCodeAt(0)
const SPACE = ' '.charCodeAt(0)
const TAB = '\t'.charCodeAt(0)
let defaultParser

const isSpace = code => {
  return code === SPACE || code === RETURN || code === TAB
}

const domainReg = /(?:^[^:]*:\/\/)?([^:\/.]+(?:\.[^:\/.]+)*)\/?.*$/
const domainRegSecure = /^https:\/\/([^:\/.]+(?:\.[^:\/.]+)*)\/?.*$/

function filter(whitelist, option) {
  const httpsOnly = option['httpsOnly']
  const reg = httpsOnly ? domainRegSecure : domainReg
  const permitted = href => {
    const checked = reg.exec(href)
    if (!checked || !checked[1]) {
      return false
    }
    const domain = checked[1]
    return whitelist.includes(domain)
  }

  return (state, silent) => {
    const ret = {
      href: '',
      title: ''
    }
    const max = state.posMax
    // parse ![..]
    if (state.src.charCodeAt(state.pos) !== EXCL) {
      return false
    }
    if (state.src.charCodeAt(state.pos + 1) !== LBRACE) {
      return false
    }
    const labelStart = state.pos + 2
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false)

    if (labelEnd < 0) {
      return false
    }

    let pos = labelEnd + 1
    if (pos >= max || state.src.charCodeAt(pos) !== LPAREN) {
      return defaultParser(state, silent)
    }
    pos++

    // skip spaces
    while(pos < max && isSpace(state.src.charCodeAt(pos))) {
      pos++
    }
    if (pos >= max) {
      return false
    }

    // parse link
    const destination = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax)
    if (destination.ok) {
      ret.href = state.md.normalizeLink(destination.str)
      if (state.md.validateLink(ret.href)) {
        if (!permitted(ret.href)) {
          return false
        }
        pos = destination.pos
      } else {
        ret.href = ''
      }
    }

    // skip spaces
    while(pos < max && isSpace(state.src.charCodeAt(pos))) {
      pos++
    }

    // parse title
    const title = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax)
    if (pos < max && title.ok) {
      ret.title = title.str
      pos = title.pos

      // skip spaces
      while(pos < max && isSpace(state.src.charCodeAt(pos))) {
        pos++
      }
      if (pos >= max) {
        return false
      }
    }

    if (pos >= max || state.src.charCodeAt(pos) !== RPAREN) {
      return false
    }
    pos++

    if (!silent) {
      const content = state.src.slice(labelStart, labelEnd)
      state.md.inline.parse(
        content,
        state.md,
        state.env,
        []
      )

      const token = state.push('image', 'img', 0)
      token.attrs = [['src', ret.href], ['alt', '']]
      token.children = []
      token.content = content
      if (ret.title !== '') {
        token.attrs.push(['title', ret.title])
      }
    }

    state.pos = pos
    state.posMax = max
    return true
  }
}

module.exports = function(whitelist, option) {
  return function(md) {
    const rule = md.inline.ruler.__rules__.find(r => r.name === 'image')
    if (!rule) {
      throw new Error('not found image rule')
    }
    defaultParser = rule.fn
    rule.fn = filter(whitelist, option || {})
  }
}
