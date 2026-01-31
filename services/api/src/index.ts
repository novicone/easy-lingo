import Fastify from 'fastify'
import { LessonSummary } from '@easy-lingo/shared'

const server = Fastify({ logger: true })

server.get('/health', async () => ({ status: 'ok' }))

server.get('/api/lessons', async (): Promise<LessonSummary[]> => {
  return [
    { id: 'l1', title: 'Basics', description: 'Podstawowe słownictwo' },
    { id: 'l2', title: 'Phrases', description: 'Przydatne zwroty' }
  ]
})

const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
