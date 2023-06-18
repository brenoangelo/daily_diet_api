import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.code(401).send()
    }

    const user = await knex('users').where('sessionId', sessionId).first()
    const meals = await knex('meals').select().where('userId', user?.id)

    return meals
  })

  // app.post('')
}
