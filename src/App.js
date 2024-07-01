import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const CleaningSchedule = () => {
  const [schedule, setSchedule] = useState({
    dailyTasks: [
      { time: '6:30 AM - 7:00 AM', tasks: ['Make beds', 'Quick tidy of living areas', "Clean dog's food and water bowls"] },
      { time: 'Evening', tasks: ['Superficial clean of the kitchen (wipe counters, load dishwasher, etc.)'] }
    ],
    robotPrep: ['Put up chairs', 'Lift curtains', "Ensure no cables are in Bobby's path", "Clean Bobby's water tank"],
    weeks: [
      {
        name: 'Week 1',
        days: [
          { name: 'Monday', tasks: ["Bobby cleans (including hallway)", "Jeremy: Dust living room", "Moana: Wipe down bathroom surfaces", "Evening: Take out trash"] },
          { name: 'Tuesday', tasks: ["Jeremy: Clean kitchen counters and sink", "Moana: Clean mirrors", "Evening: Prepare for Bobby's cleaning tomorrow"] },
          { name: 'Wednesday', tasks: ["Bobby cleans (including hallway)", "Jeremy: Clean light switches and door handles", "Moana: Dust bedroom", "Evening: Prepare for Bobby's cleaning tomorrow", "Evening: Take out trash"] },
          { name: 'Thursday', tasks: ["Bobby cleans (including hallway)", "Jeremy: Sweep kitchen floor", "Moana: Clean toilet and bathroom trash bin", "Together: Tidy hallway (remove unnecessary items, organize shoes/coats)"] },
          { name: 'Friday', tasks: ["Jeremy: Mop bathroom floor", "Moana: Wipe down kitchen appliances", "Evening: Take out trash"] },
          { name: 'Saturday', tasks: ["Jeremy: Deep clean kitchen (including appliances and oven)", "Jeremy: Clean overhead closets in kitchen", "Jeremy: Grocery shopping", "Moana: Deep clean bathroom (including bathtub/shower)", "Moana: Clean overhead closets in bathroom", "Moana: Wash dog's bed", "Together: Sort mail and handle bureaucratic tasks"] },
          { name: 'Sunday', tasks: ["Rest day / Catch up on any missed tasks", "Evening: Prepare for Bobby's cleaning tomorrow", "Evening: Take out trash"] }
        ]
      },
      // Week 2 data would go here, similar structure to Week 1
    ],
    deepCleaning: [
      { week: 'Week 1', tasks: ["Deep clean kitchen and bathroom", "Clean overhead closets in kitchen and bathroom", "Clean oven"] },
      { week: 'Week 3', tasks: ["Deep clean living room and bedrooms", "Clean windows (inside and out)", "Wash curtains/blinds"] },
      { week: 'Week 5', tasks: ["Deep clean hallway and entryway", "Clean under furniture", "Clean dock area"] },
      { week: 'Week 7', tasks: ["Deep clean garden and outdoor areas", "Clean gutters", "Power wash patio/deck (if applicable)"] }
    ]
  });

  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('dailyTasks');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const addTask = () => {
    if (newTask.trim() === '') return;

    setSchedule(prevSchedule => {
      const updatedSchedule = { ...prevSchedule };

      if (selectedCategory === 'dailyTasks') {
        updatedSchedule.dailyTasks.find(item => item.time === selectedSubcategory).tasks.push(newTask);
      } else if (selectedCategory === 'robotPrep') {
        updatedSchedule.robotPrep.push(newTask);
      } else if (selectedCategory === 'weeks') {
        const [week, day] = selectedSubcategory.split('|');
        updatedSchedule.weeks.find(w => w.name === week).days.find(d => d.name === day).tasks.push(newTask);
      } else if (selectedCategory === 'deepCleaning') {
        updatedSchedule.deepCleaning.find(item => item.week === selectedSubcategory).tasks.push(newTask);
      }

      return updatedSchedule;
    });

    setNewTask('');
  };

  const removeTask = (category, subcategory, taskIndex) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = { ...prevSchedule };

      if (category === 'dailyTasks') {
        updatedSchedule.dailyTasks.find(item => item.time === subcategory).tasks.splice(taskIndex, 1);
      } else if (category === 'robotPrep') {
        updatedSchedule.robotPrep.splice(taskIndex, 1);
      } else if (category === 'weeks') {
        const [week, day] = subcategory.split('|');
        updatedSchedule.weeks.find(w => w.name === week).days.find(d => d.name === day).tasks.splice(taskIndex, 1);
      } else if (category === 'deepCleaning') {
        updatedSchedule.deepCleaning.find(item => item.week === subcategory).tasks.splice(taskIndex, 1);
      }

      return updatedSchedule;
    });
  };

  return (
    <div className="p-4 bg-green-50">
      <h1 className="text-3xl font-bold mb-4 text-green-800 text-center">Cleaning Schedule for Jeremy and Moana</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Add New Task</h2>
        <div className="flex space-x-2">
          <select
            className="border p-2 rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="dailyTasks">Daily Tasks</option>
            <option value="robotPrep">Robot Cleaning Preparation</option>
            <option value="weeks">Weekly Tasks</option>
            <option value="deepCleaning">Deep Cleaning</option>
          </select>

          {selectedCategory === 'dailyTasks' && (
            <select
              className="border p-2 rounded"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {schedule.dailyTasks.map((item, index) => (
                <option key={index} value={item.time}>{item.time}</option>
              ))}
            </select>
          )}

          {selectedCategory === 'weeks' && (
            <select
              className="border p-2 rounded"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {schedule.weeks.flatMap(week =>
                week.days.map(day => (
                  <option key={`${week.name}|${day.name}`} value={`${week.name}|${day.name}`}>
                    {week.name} - {day.name}
                  </option>
                ))
              )}
            </select>
          )}

          {selectedCategory === 'deepCleaning' && (
            <select
              className="border p-2 rounded"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {schedule.deepCleaning.map((item, index) => (
                <option key={index} value={item.week}>{item.week}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
            className="border p-2 rounded flex-grow"
          />
          <button onClick={addTask} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2 text-green-700">Daily Tasks</h2>
        {schedule.dailyTasks.map((item, itemIndex) => (
          <div key={itemIndex} className="mb-4 bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-green-600">{item.time}</h3>
            <ul className="list-disc pl-5">
              {item.tasks.map((task, taskIndex) => (
                <li key={taskIndex} className="flex items-center justify-between">
                  <span>{task}</span>
                  <button
                    onClick={() => removeTask('dailyTasks', item.time, taskIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h2 className="text-2xl font-semibold mb-2 mt-6 text-green-700">Robot Cleaning Preparation</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul className="list-disc pl-5">
            {schedule.robotPrep.map((task, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{task}</span>
                <button
                  onClick={() => removeTask('robotPrep', null, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {schedule.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="mt-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-700">{week.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {week.days.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-white p-4 rounded shadow">
                  <h3 className="font-semibold text-green-600 mb-2">{day.name}</h3>
                  <ul className="list-disc pl-5">
                    {day.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-center justify-between">
                        <span>{task}</span>
                        <button
                          onClick={() => removeTask('weeks', `${week.name}|${day.name}`, taskIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        <h2 className="text-2xl font-semibold mb-2 mt-6 text-green-700">Deep Cleaning Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.deepCleaning.map((item, itemIndex) => (
            <div key={itemIndex} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-green-600 mb-2">{item.week}</h3>
              <ul className="list-disc pl-5">
                {item.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center justify-between">
                    <span>{task}</span>
                    <button
                      onClick={() => removeTask('deepCleaning', item.week, taskIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <CleaningSchedule />
    </div>
  );
}

export default App;