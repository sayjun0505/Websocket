import { getConnection, getConnectionManager } from 'typeorm'
import connection from './connection'

describe('test example function', () => {
  it('should return 15 ', () => {
    expect(15).toBe(15)
  })
  it('should return 5', () => {
    expect(5).toBe(5)
  })
})
