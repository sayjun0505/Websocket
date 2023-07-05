import packageAPI from '../../organization/package'

describe('Package has routes', () => {
  const routes = [
    { path: '/packages', method: 'get' },
    { path: '/package/:id', method: 'get' },
  ]

  const noMethods = [
    { method: 'post' },
    { method: 'put' },
    { method: 'delete' },
  ]

  it.each(routes)('$method\t exists on $path\t', (route) => {
    expect(
      packageAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(route.method),
      ),
    ).toBe(true)
    expect(
      packageAPI.router.stack.some((s) => s.route.path === route.path),
    ).toBe(true)
  })

  it.each(noMethods)('$method\t not exists\t', ({ method }) => {
    expect(
      packageAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(method),
      ),
    ).toBe(false)
  })
})
