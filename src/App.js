import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Edit2, Save, Moon, Sun } from 'lucide-react';

const API_BASE_URL = 'https://cleanteam-backend-54d4cf0068f0.herokuapp.com'; // Update this to your backend URL

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <form onSubmit={handleLogin} className={`p-8 rounded shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl mb-4 font-bold">Login</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <CleaningSchedule token={token} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}

// CleaningSchedule component
const CleaningSchedule = ({ token, onLogout, darkMode, toggleDarkMode }) => {
  const [schedule, setSchedule] = useState({
    dailyTasks: [],
    robotPrep: [],
    weeks: [],
    deepCleaning: []
  });
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('dailyTasks');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(response.data || {
        dailyTasks: [],
        robotPrep: [],
        weeks: [],
        deepCleaning: []
      });
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const updateSchedule = async (newSchedule) => {
    try {
      await axios.put(`${API_BASE_URL}/schedule`, { schedule: newSchedule }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const addTask = () => {
    if (newTask.trim() === '') return;

    const updatedSchedule = { ...schedule };
    const taskWithAssignee = { task: newTask, assignee: selectedAssignee };

    if (selectedCategory === 'dailyTasks') {
      const dailyTask = updatedSchedule.dailyTasks.find(item => item.time === selectedSubcategory);
      if (dailyTask) {
        dailyTask.tasks.push(taskWithAssignee);
      } else {
        updatedSchedule.dailyTasks.push({ time: selectedSubcategory, tasks: [taskWithAssignee] });
      }
    } else if (selectedCategory === 'robotPrep') {
      updatedSchedule.robotPrep.push(taskWithAssignee);
    } else if (selectedCategory === 'weeks') {
      const [weekName, dayName] = selectedSubcategory.split('|');
      const week = updatedSchedule.weeks.find(w => w.name === weekName);
      if (week) {
        const day = week.days.find(d => d.name === dayName);
        if (day) {
          day.tasks.push(taskWithAssignee);
        } else {
          week.days.push({ name: dayName, tasks: [taskWithAssignee] });
        }
      } else {
        updatedSchedule.weeks.push({
          name: weekName,
          days: [{ name: dayName, tasks: [taskWithAssignee] }]
        });
      }
    } else if (selectedCategory === 'deepCleaning') {
      const deepCleaningItem = updatedSchedule.deepCleaning.find(item => item.week === selectedSubcategory);
      if (deepCleaningItem) {
        deepCleaningItem.tasks.push(taskWithAssignee);
      } else {
        updatedSchedule.deepCleaning.push({ week: selectedSubcategory, tasks: [taskWithAssignee] });
      }
    }

    updateSchedule(updatedSchedule);
    setNewTask('');
    setSelectedAssignee('');
  };

  const removeTask = (category, subcategory, taskIndex) => {
    const updatedSchedule = { ...schedule };

    if (category === 'dailyTasks') {
      const dailyTask = updatedSchedule.dailyTasks.find(item => item.time === subcategory);
      if (dailyTask) {
        dailyTask.tasks.splice(taskIndex, 1);
      }
    } else if (category === 'robotPrep') {
      updatedSchedule.robotPrep.splice(taskIndex, 1);
    } else if (category === 'weeks') {
      const [weekName, dayName] = subcategory.split('|');
      const week = updatedSchedule.weeks.find(w => w.name === weekName);
      if (week) {
        const day = week.days.find(d => d.name === dayName);
        if (day) {
          day.tasks.splice(taskIndex, 1);
        }
      }
    } else if (category === 'deepCleaning') {
      const deepCleaningItem = updatedSchedule.deepCleaning.find(item => item.week === subcategory);
      if (deepCleaningItem) {
        deepCleaningItem.tasks.splice(taskIndex, 1);
      }
    }

    updateSchedule(updatedSchedule);
  };

  const toggleEditMode = (category, subcategory, taskIndex) => {
    setEditMode(prev => ({
      ...prev,
      [`${category}-${subcategory}-${taskIndex}`]: !prev[`${category}-${subcategory}-${taskIndex}`]
    }));
  };

  const handleEditTask = (category, subcategory, taskIndex, newValue, newAssignee) => {
    const updatedSchedule = { ...schedule };

    if (category === 'dailyTasks') {
      const dailyTask = updatedSchedule.dailyTasks.find(item => item.time === subcategory);
      if (dailyTask) {
        dailyTask.tasks[taskIndex] = { task: newValue, assignee: newAssignee };
      }
    } else if (category === 'robotPrep') {
      updatedSchedule.robotPrep[taskIndex] = { task: newValue, assignee: newAssignee };
    } else if (category === 'weeks') {
      const [weekName, dayName] = subcategory.split('|');
      const week = updatedSchedule.weeks.find(w => w.name === weekName);
      if (week) {
        const day = week.days.find(d => d.name === dayName);
        if (day) {
          day.tasks[taskIndex] = { task: newValue, assignee: newAssignee };
        }
      }
    } else if (category === 'deepCleaning') {
      const deepCleaningItem = updatedSchedule.deepCleaning.find(item => item.week === subcategory);
      if (deepCleaningItem) {
        deepCleaningItem.tasks[taskIndex] = { task: newValue, assignee: newAssignee };
      }
    }

    updateSchedule(updatedSchedule);
    toggleEditMode(category, subcategory, taskIndex);
  };

  const renderTasks = (category, subcategory, tasks) => {
    return tasks.map((taskItem, index) => (
      <li key={index} className="flex items-center justify-between p-2 border-b last:border-b-0 dark:border-gray-700">
        {editMode[`${category}-${subcategory}-${index}`] ? (
          <>
            <input
              type="text"
              value={taskItem.task}
              onChange={(e) => handleEditTask(category, subcategory, index, e.target.value, taskItem.assignee)}
              className="flex-grow mr-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={taskItem.assignee}
              onChange={(e) => handleEditTask(category, subcategory, index, taskItem.task, e.target.value)}
              className="mr-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Unassigned</option>
              <option value="Moana">Moana</option>
              <option value="Jeremy">Jeremy</option>
            </select>
          </>
        ) : (
          <span className="flex-grow">
            {taskItem.task} 
            {taskItem.assignee && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({taskItem.assignee})</span>}
          </span>
        )}
        <div className="flex items-center">
          <button onClick={() => toggleEditMode(category, subcategory, index)} className="text-blue-500 mr-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900">
            {editMode[`${category}-${subcategory}-${index}`] ? <Save size={18} /> : <Edit2 size={18} />}
          </button>
          <button onClick={() => removeTask(category, subcategory, index)} className="text-red-500 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900">
            <Trash2 size={18} />
          </button>
        </div>
      </li>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 bg-green-600 dark:bg-green-800">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Cleaning Schedule for Jeremy and Moana</h1>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="text-white p-2 rounded-full hover:bg-green-700 dark:hover:bg-green-900 transition duration-300">
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">
                Logout
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="dailyTasks">Daily Tasks</option>
                <option value="robotPrep">Robot Cleaning Preparation</option>
                <option value="weeks">Weekly Tasks</option>
                <option value="deepCleaning">Deep Cleaning</option>
              </select>

              {selectedCategory === 'dailyTasks' && (
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full sm:w-auto p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              )}

              {selectedCategory === 'deepCleaning' && (
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full sm:w-auto p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Week</option>
                  <option value="Week 1">Week 1</option>
                  <option value="Week 2">Week 2</option>
                  <option value="Week 3">Week 3</option>
                  <option value="Week 4">Week 4</option>
                </select>
              )}

              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New task"
                className="w-full sm:w-auto p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
              />

              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full sm:w-auto p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Assign to</option>
                <option value="Moana">Moana</option>
                <option value="Jeremy">Jeremy</option>
              </select>

              <button 
                onClick={addTask} 
                className="w-full sm:w-auto bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300 flex items-center justify-center"
              >
                <PlusCircle size={18} className="mr-1" /> Add Task
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-500">Daily Tasks</h2>
                {schedule.dailyTasks.map(({ time, tasks }) => (
                  <div key={time} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <h3 className="font-semibold bg-green-100 dark:bg-green-900 p-2">{time}</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {renderTasks('dailyTasks', time, tasks)}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-500">Robot Cleaning Preparation</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {renderTasks('robotPrep', 'robotPrep', schedule.robotPrep)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-500">Weekly Tasks</h2>
              {schedule.weeks.map((week) => (
                <div key={week.name} className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{week.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {week.days.map((day) => (
                      <div key={day.name} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <h4 className="font-medium bg-green-100 dark:bg-green-900 p-2">{day.name}</h4>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {renderTasks('weeks', `${week.name}|${day.name}`, day.tasks)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-500">Deep Cleaning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.deepCleaning.map(({ week, tasks }) => (
                  <div key={week} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <h3 className="font-semibold bg-green-100 dark:bg-green-900 p-2">{week}</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {renderTasks('deepCleaning', week, tasks)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;