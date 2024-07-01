import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2 } from 'lucide-react';

// Set the base URL for your API
const API_BASE_URL = 'https://cleanteam-backend-54d4cf0068f0.herokuapp.com'; // Change this to your deployed backend URL

const CleaningSchedule = ({ token, onLogout }) => {
  const [schedule, setSchedule] = useState({
    dailyTasks: [],
    robotPrep: [],
    weeks: [],
    deepCleaning: []
  });
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('dailyTasks');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

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

    if (selectedCategory === 'dailyTasks') {
      const dailyTask = updatedSchedule.dailyTasks.find(item => item.time === selectedSubcategory);
      if (dailyTask) {
        dailyTask.tasks.push(newTask);
      } else {
        updatedSchedule.dailyTasks.push({ time: selectedSubcategory, tasks: [newTask] });
      }
    } else if (selectedCategory === 'robotPrep') {
      updatedSchedule.robotPrep.push(newTask);
    } else if (selectedCategory === 'weeks') {
      const [weekName, dayName] = selectedSubcategory.split('|');
      const week = updatedSchedule.weeks.find(w => w.name === weekName);
      if (week) {
        const day = week.days.find(d => d.name === dayName);
        if (day) {
          day.tasks.push(newTask);
        } else {
          week.days.push({ name: dayName, tasks: [newTask] });
        }
      } else {
        updatedSchedule.weeks.push({
          name: weekName,
          days: [{ name: dayName, tasks: [newTask] }]
        });
      }
    } else if (selectedCategory === 'deepCleaning') {
      const deepCleaningItem = updatedSchedule.deepCleaning.find(item => item.week === selectedSubcategory);
      if (deepCleaningItem) {
        deepCleaningItem.tasks.push(newTask);
      } else {
        updatedSchedule.deepCleaning.push({ week: selectedSubcategory, tasks: [newTask] });
      }
    }

    updateSchedule(updatedSchedule);
    setNewTask('');
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

  return (
    <div className="p-4 bg-green-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-green-800">Cleaning Schedule</h1>
        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Rest of the component remains the same */}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      onLogin(response.data.token);
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Login
        </button>
      </form>
    </div>
  );
};

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/register`, { username, password });
      onRegister();
    } catch (error) {
      setError('Registration failed. Please try a different username.');
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Register
        </button>
      </form>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleRegister = () => {
    setIsRegistering(false);
  };

  if (!token) {
    if (isRegistering) {
      return <Register onRegister={handleRegister} />;
    }
    return (
      <div>
        <Login onLogin={handleLogin} />
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <button onClick={() => setIsRegistering(true)} className="text-green-500 hover:underline">
            Register here
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="App">
      <CleaningSchedule token={token} onLogout={handleLogout} />
    </div>
  );
}

export default App;