import organizationAPI from '../../organization/organization'

describe('Organization has routes', () => {
  const routes = [
    { path: '/organizations', method: 'get' },
    { path: '/organization/:id', method: 'get' },
    { path: '/organization', method: 'post' },
    { path: '/organization', method: 'put' },
    { path: '/organization/:id', method: 'delete' },
  ]

  it.each(routes)('$method\t exists on $path\t', (route) => {
    expect(
      organizationAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(route.method),
      ),
    ).toBe(true)
    expect(
      organizationAPI.router.stack.some((s) => s.route.path === route.path),
    ).toBe(true)
  })
})
