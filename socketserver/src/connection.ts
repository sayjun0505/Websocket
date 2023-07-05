import { createConnection, getConnection } from 'typeorm'

const connection = {
  async create() {
    await createConnection()
  },

  async close() {
    await getConnection().close()
  },

  async clear() {
    const conn = getConnection()
    const entities = conn.entityMetadatas

    entities.forEach(async (entity) => {
      const repository = conn.getRepository(entity.name)
      await repository.query(`DELETE FROM ${entity.tableName}`)
    })
  },
}
export default connection
