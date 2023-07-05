import activationAPI from '../../organization/activation'

describe('Activation has routes', () => {
  const routes = [
    { path: '/activations', method: 'get' },
    { path: '/activation/:id', method: 'get' },
  ]

  const noMethods = [
    { method: 'post' },
    { method: 'put' },
    { method: 'delete' },
  ]

  it.each(routes)('$method\t exists on $path\t', (route) => {
    expect(
      activationAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(route.method),
      ),
    ).toBe(true)
    expect(
      activationAPI.router.stack.some((s) => s.route.path === route.path),
    ).toBe(true)
  })

  it.each(noMethods)('$method\t not exists\t', ({ method }) => {
    expect(
      activationAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(method),
      ),
    ).toBe(false)
  })
})
