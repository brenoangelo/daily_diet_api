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

  app.post('/login', async (request, reply) => {
    const getUsersParamsSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = getUsersParamsSchema.parse(request.body)

    try {
      const user = await knex('users').where('email', email).first()

      const isPasswordCorreclty = user?.password === password

      if (!isPasswordCorreclty) {
        throw new Error('Invalid password')
      }

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })

        await knex('users').where('id', user.id).update({
          sessionId,
        })
      }

      return reply.status(200).send()
    } catch (error) {
      console.error('Has error')

      return reply.status(401).send()
    }
  })
}
