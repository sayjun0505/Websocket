import organization from '../src/api/organization'

test('has routes', () => {
  const routes = [
    { path: '/signup', method: 'post' },
    { path: '/login', method: 'post' },
    { path: '/reset', method: 'post' },
  ]

  it.each(routes)('`$method` exists on $path', (route) => {
    expect(
      organization.organizationRouter.stack.some((s) =>
        Object.keys(s.route.methods).includes(route.method),
      ),
    ).toBe(true)
    expect(
      organization.organizationRouter.stack.some(
        (s) => s.route.path === route.path,
      ),
    ).toBe(true)
  })
})
