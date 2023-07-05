// import path from 'path'
// import { config } from 'dotenv'
// config({ path: path.join(__dirname, '../../../env/.env') })
import channelAPI from '../../channel/channel'

describe('Channel has routes', () => {
  const routes = [
    { path: '/channel/list', method: 'get' },
    { path: '/channel/:id', method: 'get' },
    { path: '/channel', method: 'post' },
    { path: '/channel', method: 'put' },
    { path: '/channel/:id', method: 'delete' },
    { path: '/channel/exchangeToken/:accessToken', method: 'get' },
  ]

  it.each(routes)('$method\t exists on $path\t', (route) => {
    expect(
      channelAPI.router.stack.some((s) =>
        Object.keys(s.route.methods).includes(route.method),
      ),
    ).toBe(true)
    expect(
      channelAPI.router.stack.some((s) => s.route.path === route.path),
    ).toBe(true)
  })
})
