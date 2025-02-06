import { Request, Response } from 'express'
import prisma from '../lib/db'

export async function getTasks(req: Request, res: Response) {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return res.status(500).json({ error: 'Error fetching tasks' })
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    console.log('Creating task with data:', req.body)
    
    if (!req.body.text) {
      return res.status(400).json({ error: 'Task text is required' })
    }

    const taskData = {
      text: req.body.text,
      timeSpent: req.body.timeSpent || 0,
      difficulty: req.body.difficulty || 'medium',
      dateCompleted: new Date(req.body.dateCompleted)
    }

    console.log('Attempting to create task with:', taskData)

    const task = await prisma.task.create({
      data: taskData
    })
    
    console.log('Task created successfully:', task)
    return res.status(201).json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return res.status(500).json({ 
      error: 'Error creating task', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        dateCompleted: req.body.dateCompleted ? new Date(req.body.dateCompleted) : undefined
      }
    })
    return res.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return res.status(500).json({ error: 'Error updating task' })
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    await prisma.task.delete({
      where: { id: parseInt(req.params.id) }
    })
    return res.status(204).end()
  } catch (error) {
    console.error('Error deleting task:', error)
    return res.status(500).json({ error: 'Error deleting task' })
  }
} 