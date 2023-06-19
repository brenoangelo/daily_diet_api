import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      if (!sessionId) {
        return reply.code(401).send()
      }

      const user = await knex('users').where('sessionId', sessionId).first()
      const meals = await knex('meals').select().where('userId', user?.id)

      return meals
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()

      return meal
    },
  )

  app.post(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isInsideDiet: z.boolean(),
      })

      const { name, description, date, isInsideDiet } =
        getMealsParamsSchema.parse(request.body)

      const sessionId = request.cookies.sessionId

      const user = await knex('users').where('sessionId', sessionId).first()

      await knex('meals').insert({
        name,
        description,
        date: new Date(date),
        isInsideDiet,
        id: randomUUID(),
        userId: user?.id,
      })

      reply.code(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isInsideDiet: z.boolean(),
      })

      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { name, description, date, isInsideDiet } =
        getMealsBodySchema.parse(request.body)

      await knex('meals')
        .where('id', id)
        .update({
          name,
          description,
          date: new Date(date),
          isInsideDiet,
        })

      reply.code(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      await knex('meals').where('id', id).delete()

      reply.code(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const user = await knex('users').where('sessionId', sessionId).first()
      const meals = await knex('meals').select().where('userId', user?.id)

      const userMealsMetrics = meals.reduce(
        (acc, currentMeal) => {
          if (currentMeal.isInsideDiet) {
            return {
              ...acc,
              insideDiet: acc.insideDiet + 1,
              meals: acc.meals + 1,
            }
          }

          return {
            ...acc,
            outsideDiet: acc.outsideDiet + 1,
            meals: acc.meals + 1,
          }
        },
        {
          meals: 0,
          insideDiet: 0,
          outsideDiet: 0,
        },
      )

      return userMealsMetrics
    },
  )
}
