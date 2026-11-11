const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { transformSync } = require('next/dist/build/swc')

function loadModule(file, mocks = {}, globals = {}) {
  const filename = path.join(__dirname, '..', file)
  const { code } = transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  })
  const module = { exports: {} }
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => name in mocks ? mocks[name] : require(name),
    process, URLSearchParams, ...globals,
  }, { filename })
  return module.exports.default
}

function filterLinks(capabilities, specialFilter = '') {
  const Link = () => null
  const Header = loadModule('components/HomeHeader.js', {
    react: { useState: () => [capabilities, () => {}], useEffect: () => {} },
    'next/router': { useRouter: () => ({ query: { tab: 'anime', special_filter: specialFilter } }) },
    'next/link': Link,
    '@/apis/AnimapuApi': {},
    '@/components/layouts/UserDropdown': () => null,
    'lucide-react': {},
  })
  const links = []
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach(visit)
    if (node.type === Link && node.props.href?.pathname === '/home') links.push(node.props)
    visit(node.props?.children)
  }
  visit(Header({ activeMedia: 'anime', animeSource: 'kuramanime' }))
  return links
}

test('Completed and All are independently gated by capabilities', () => {
  assert.equal(filterLinks([]).length, 1)
  const completed = filterLinks([{ get_completed: true, get_all: false }], 'completed')
  assert.equal(completed.length, 2)
  assert.equal(completed[1].href.query.special_filter, 'completed')
  assert.equal(completed[1]['aria-current'], 'page')
  assert.equal(completed[1].href.query.tab, 'anime')
  assert.equal(completed[0].href.query.special_filter, undefined)
  const all = filterLinks([{ get_completed: false, get_all: true }], 'all')
  assert.equal(all.length, 2)
  assert.equal(all[1].href.query.special_filter, 'all')
  assert.equal(filterLinks([{ get_completed: true, get_all: true }]).length, 3)
})

test('Anime API forwards filter, page, source and cancellation', async () => {
  const calls = []
  const api = loadModule('apis/AnimapuApi.js', { uuid: { v4: () => 'test' } }, {
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true } },
  })
  api.GenHeaders = () => ({})
  const signal = new AbortController().signal
  for (const filter of ['', 'completed', 'all']) {
    await api.GetLatestAnime({ anime_source: 'kuramanime', page: 2, special_filter: filter, signal })
    const call = calls.at(-1)
    const url = new URL(call.url)
    assert.equal(url.pathname, '/animes/kuramanime/latest')
    assert.equal(url.searchParams.get('page'), '2')
    assert.equal(url.searchParams.get('special_filter'), filter || null)
    assert.equal(call.options.signal, signal)
  }
  await api.GetAnimeCapabilities({ anime_source: 'otakudesu', signal })
  assert.equal(new URL(calls.at(-1).url).pathname, '/animes/otakudesu/capabilities')
})

test('Changing filters resets pagination and ignores stale responses', async () => {
  const requests = []
  const effects = []
  const state = ['kuramanime', [], false, true, '']
  let hookIndex = 0
  const query = { special_filter: '' }
  let onScroll
  const api = {
    GetLatestAnime: (params) => new Promise((resolve) => requests.push({ params, resolve })),
  }
  const Latest = loadModule('pages/anime/latest.js', {
    react: {
      useState: () => {
        const index = hookIndex++
        return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
      },
      useEffect: (effect) => effects.push(effect),
    },
    'next/router': { useRouter: () => ({ isReady: true, query }) },
    '@/apis/AnimapuApi': api,
    '@/components/ChangeAnimeSourceModalOnly': () => null,
    '@/components/ui/card': {},
    '@/components/ui/button': {},
    '@/components/AnimeCard': () => null,
    '@/components/AnimeCardBar': () => null,
  }, {
    AbortController,
    window: {
      scrollY: 0, innerHeight: 1000,
      addEventListener: (_, callback) => { onScroll = callback },
      removeEventListener: () => {},
    },
    document: { documentElement: { scrollHeight: 1500 } },
    requestAnimationFrame: (callback) => { queueMicrotask(callback); return 1 },
    cancelAnimationFrame: () => {},
  })
  const flush = () => new Promise((resolve) => setImmediate(resolve))
  function render() {
    hookIndex = 0
    effects.length = 0
    Latest({ contentOnly: true })
    return effects[1]()
  }
  const cleanup = render()
  assert.equal(requests[0].params.page, 1)
  requests[0].resolve({ ok: true, json: async () => ({ data: [{ id: 'latest' }] }) })
  await flush()
  onScroll()
  await flush()
  assert.equal(requests[1].params.page, 2)
  cleanup()
  assert.equal(requests[1].params.signal.aborted, true)
  query.special_filter = 'completed'
  const cleanupCompleted = render()
  assert.equal(requests[2].params.page, 1)
  assert.equal(requests[2].params.special_filter, 'completed')
  requests[2].resolve({ ok: true, json: async () => ({ data: [] }) })
  requests[1].resolve({ ok: true, json: async () => ({ data: [{ id: 'stale' }] }) })
  await flush()
  assert.equal(state[1].length, 0)
  onScroll()
  await flush()
  assert.equal(requests.length, 3)
  cleanupCompleted()
})
