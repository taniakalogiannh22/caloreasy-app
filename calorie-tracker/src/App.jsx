import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function App() {
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [apiFood, setApiFood] = useState("");
  const [apiResults, setApiResults] = useState([]);

  const [dailyGoal, setDailyGoal] = useState(2000);

  // ✅ Date state
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [foods, setFoods] = useState(() => {
    const savedFoods = localStorage.getItem("foods");
    return savedFoods ? JSON.parse(savedFoods) : [];
  });

  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods));
  }, [foods]);

  // ✅ Add food with date
  const addFood = () => {
    if (!food || !calories) return;

    const newFood = {
      id: Date.now(),
      name: food,
      calories: Number(calories),
      protein: protein ? Number(protein) : 0,
      carbs: carbs ? Number(carbs) : 0,
      fat: fat ? Number(fat) : 0,
      date: selectedDate
    };

    setFoods([...foods, newFood]);

    setFood("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  };

  const deleteFood = (id) => {
    setFoods(foods.filter(f => f.id !== id));
  };

  const searchFood = async () => {
    if (!apiFood) return;

    try {
      const res = await axios.get(
        `https://api.api-ninjas.com/v1/nutrition?query=${apiFood}`,
        {
          headers: {
            'X-Api-Key': import.meta.env.VITE_API_KEY
          }
        }
      );

      setApiResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Filter foods by selected date
  const dailyFoods = foods.filter(f => f.date === selectedDate);

  const totalCalories = dailyFoods.reduce((sum, f) => sum + f.calories, 0);

  const remainingCalories = dailyGoal - totalCalories;

  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  const chartData = dailyFoods.map(f => ({
    name: f.name,
    Protein: f.protein,
    Carbs: f.carbs,
    Fat: f.fat
  }));

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>

      {/* Dark Mode */}
      <button
        className="button"
        onClick={() => setDarkMode(!darkMode)}
        style={{
          backgroundColor: darkMode ? "#fff" : "#111",
          color: darkMode ? "#000" : "#fff"
        }}
      >
        {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
      </button>

      <h1>CalorEasy 🍎</h1>

      {/* Date Picker */}
      <h3>Select Date</h3>
      <input
        className="input"
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
      />

      {/* Calories Info */}
      <h3>Total Calories: {totalCalories}</h3>

      <h3>
        Remaining:{" "}
        <span style={{
          color: remainingCalories < 0 ? "#f44336" : "#4caf50",
          fontWeight: "bold"
        }}>
          {remainingCalories} kcal
        </span>
      </h3>

      {/* Progress */}
      <h3>Daily Goal: {dailyGoal} kcal</h3>

      <div style={{
        width: "100%",
        height: "20px",
        background: darkMode ? "#333" : "#eee",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: progress < 100
            ? "linear-gradient(90deg,#4caf50,#8bc34a)"
            : "linear-gradient(90deg,#f44336,#e57373)"
        }} />
      </div>

      <p>{Math.round(progress)}% of goal reached</p>

      <input
        className="input"
        type="number"
        value={dailyGoal}
        onChange={e => setDailyGoal(Number(e.target.value))}
        placeholder="Set daily goal"
      />

      {/* API Search */}
      <div style={{ marginTop: "20px" }}>
        <h3>Search Food Database</h3>

        <input
          className="input"
          value={apiFood}
          onChange={e => setApiFood(e.target.value)}
          placeholder="Search food"
        />

        <button className="button" onClick={searchFood}>
          Search
        </button>

        {apiResults.map((f, i) => (
          <div key={i} className="card">
            <div>
              <strong>{f.name}</strong>
              <div style={{ fontSize: "12px" }}>
                Calories: {Math.round(f.calories)} | 
                P:{Math.round(f.protein_g)}g 
                C:{Math.round(f.carbohydrates_total_g)}g 
                F:{Math.round(f.fat_total_g)}g
              </div>
            </div>

            <button onClick={() => {
              const newFood = {
                id: Date.now(),
                name: f.name,
                calories: Math.round(f.calories),
                protein: Math.round(f.protein_g),
                carbs: Math.round(f.carbohydrates_total_g),
                fat: Math.round(f.fat_total_g),
                date: selectedDate
              };

              setFoods([...foods, newFood]);
            }}>
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Manual Input */}
      <div style={{ marginTop: "20px" }}>
        <input className="input" placeholder="Food" value={food} onChange={e => setFood(e.target.value)} />
        <input className="input" placeholder="Calories" type="number" value={calories} onChange={e => setCalories(e.target.value)} />
        <input className="input" placeholder="Protein" type="number" value={protein} onChange={e => setProtein(e.target.value)} />
        <input className="input" placeholder="Carbs" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} />
        <input className="input" placeholder="Fat" type="number" value={fat} onChange={e => setFat(e.target.value)} />

        <button className="button" onClick={addFood}>Add</button>
      </div>

      {/* Search */}
      <input
        className="input"
        placeholder="Search food..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginTop: "20px" }}
      />

      {/* Food List (filtered by date + search) */}
      <div style={{ marginTop: "20px" }}>
        {dailyFoods
          .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
          .map(f => (
            <div key={f.id} className="card">
              <div>
                <strong>{f.name}</strong> — {f.calories} kcal
                <div style={{ fontSize: "12px" }}>
                  P:{f.protein}g C:{f.carbs}g F:{f.fat}g
                </div>
              </div>

              <button onClick={() => deleteFood(f.id)}>❌</button>
            </div>
          ))}
      </div>

      {/* Chart */}
      {dailyFoods.length > 0 && (
        <>
          <h2>Nutrition Breakdown 📊</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Protein" />
              <Bar dataKey="Carbs" />
              <Bar dataKey="Fat" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

    </div>
  );
}

export default App;