import fastify from 'fastify'
import { userRoutes } from './routes/user'

const app = fastify()

app.register(userRoutes, {
  prefix: 'user',
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running! 🚀')
  })
