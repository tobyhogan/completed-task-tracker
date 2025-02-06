import React, { useState, useEffect } from 'react'
import prisma from '../lib/db'

interface Task {
  id: number
  text: string
  timeSpent: number // in minutes
  difficulty: string
  dateCompleted: string // Store as ISO string with time
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }
    fetchTasks()
  }, [])

  const getCurrentDateTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // Format: "YYYY-MM-DDThh:mm"
  }

  const addTask = async () => {
    if (newTaskText.trim() === '') return
    
    const newTask = {
      text: newTaskText,
      timeSpent: 0,
      difficulty: 'medium',
      dateCompleted: getCurrentDateTime()
    }
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const savedTask = await response.json()
      setTasks([...tasks, savedTask])
      setNewTaskText('')
    } catch (error) {
      console.error('Error adding task:', error)
      // Optionally show error to user
      alert('Failed to add task: ' + error.message)
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const updateTimeSpent = async (taskId: number, newTime: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSpent: newTime }),
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (error) {
      console.error('Error updating time spent:', error)
    }
  }

  const updateDifficulty = async (taskId: number, difficulty: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty }),
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (error) {
      console.error('Error updating difficulty:', error)
    }
  }

  const updateDateCompleted = async (taskId: number, date: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateCompleted: date }),
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (error) {
      console.error('Error updating date:', error)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const timeOptions = [
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 45, label: '45m' },
    { value: 60, label: '1h' },
    { value: 90, label: '1.5h' },
    { value: 120, label: '2h' },
    { value: 180, label: '3h' },
    { value: 240, label: '4h' },
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'hard', label: 'Hard', color: 'text-orange-600' },
    { value: 'very-hard', label: 'Very Hard', color: 'text-red-600' },
  ]

  const getDifficultyColor = (difficulty: string): string => {
    return difficultyOptions.find(option => option.value === difficulty)?.color || 'text-gray-600'
  }

  const toggleMenu = (taskId: number) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId)
  }

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="max-w-md w-full">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Enter a new task"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Task
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map(task => (
          <li 
            key={task.id}
            className="bg-white p-4 rounded-lg shadow-sm relative"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation() // Prevent menu from closing immediately
                  toggleMenu(task.id)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Task menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {openMenuId === task.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <button
                    onClick={() => {
                      deleteTask(task.id)
                      setOpenMenuId(null)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Task
                  </button>
                </div>
              )}
            </div>

            <div className="mb-2">
              <span className="text-gray-800">
                {task.text}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Time spent:</span>
                <select
                  value={task.timeSpent}
                  onChange={(e) => updateTimeSpent(task.id, Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                >
                  <option value="0">Select time</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Difficulty:</span>
                <select
                  value={task.difficulty}
                  onChange={(e) => updateDifficulty(task.id, e.target.value)}
                  className={`text-sm border rounded px-2 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium ${getDifficultyColor(task.difficulty)}`}
                >
                  {difficultyOptions.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className={option.color}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Completed:</span>
                <input
                  type="datetime-local"
                  value={task.dateCompleted}
                  onChange={(e) => updateDateCompleted(task.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskList 