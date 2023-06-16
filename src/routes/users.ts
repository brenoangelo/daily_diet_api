import { z } from 'zod'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const getUsersParamsSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { email, name, password } = getUsersParamsSchema.parse(request.body)

    await knex('users').insert({
      email,
      name,
      password,
      id: randomUUID(),
    })

    return reply.status(201).send()
  })
}
