import express from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks'
import prisma from './lib/db'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body)
  next()
})

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// API routes with error handling
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await getTasks(req, res)
    return result
  } catch (error) {
    console.error('Error in GET /api/tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/tasks', async (req, res) => {
  try {
    console.log('POST /api/tasks body:', req.body)
    const result = await createTask(req, res)
    return result
  } catch (error) {
    console.error('Error in POST /api/tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const result = await updateTask(req, res)
    return result
  } catch (error) {
    console.error('Error in PATCH /api/tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await deleteTask(req, res)
    return result
  } catch (error) {
    console.error('Error in DELETE /api/tasks:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Something broke!', 
    message: err.message 
  })
})

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const PORT = 4000

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

startServer()

export default app 