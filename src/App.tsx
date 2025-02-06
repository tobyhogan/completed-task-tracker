import React from 'react'
import Header from './components/Header'
import TaskList from './components/TaskList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Tasks Done Tracker
        </h1>
        <div className="flex justify-center">
          <TaskList />
        </div>
      </main>
    </div>
  )
}

export default App 