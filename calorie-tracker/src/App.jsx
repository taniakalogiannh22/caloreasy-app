import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function App() {
  // Manual tracker
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  // Search & dark mode
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // API nutrition
  const [apiFood, setApiFood] = useState("");
  const [apiResults, setApiResults] = useState([]);

  // Daily goal
  const [dailyGoal, setDailyGoal] = useState(2000);

  // Tracked foods
  const [foods, setFoods] = useState(() => {
    const savedFoods = localStorage.getItem("foods");
    return savedFoods ? JSON.parse(savedFoods) : [];
  });

  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods));
  }, [foods]);

  const addFood = () => {
    if (!food || !calories) return;
    const newFood = {
      id: Date.now(),
      name: food,
      calories: Number(calories),
      protein: protein ? Number(protein) : 0,
      carbs: carbs ? Number(carbs) : 0,
      fat: fat ? Number(fat) : 0,
    };
    setFoods([...foods, newFood]);
    setFood(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
  };

  const deleteFood = (id) => setFoods(foods.filter(f => f.id !== id));

  const searchFood = async () => {
    if (!apiFood) return;
    try {
      const res = await axios.get(
        `https://api.api-ninjas.com/v1/nutrition?query=${apiFood}`,
        { headers: { 'X-Api-Key': 'CvDQ3IWaVpsBuF2gq3zGBNOXo2WRunqKzZp8f16W' } }
      );
      setApiResults(res.data);
    } catch (err) { console.log(err); }
  };

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  const chartData = foods.map(f => ({
    name: f.name,
    Protein: f.protein,
    Carbs: f.carbs,
    Fat: f.fat
  }));

  return (
    <div style={{
      width: "90%", maxWidth: "900px", margin: "auto", fontFamily: "Arial",
      padding: "20px", backgroundColor: darkMode ? "#111" : "#fff",
      color: darkMode ? "#fff" : "#000", minHeight: "100vh"
    }}>

      {/* Dark Mode */}
      <button onClick={() => setDarkMode(!darkMode)} style={{
        padding:"6px 12px", borderRadius:"8px", border:"none",
        cursor:"pointer", marginBottom:"10px",
        backgroundColor: darkMode ? "#fff" : "#111",
        color: darkMode ? "#000" : "#fff"
      }}>
        {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
      </button>

      <h1>CalorEasy 🍎</h1>
      <h3>Total Calories: {totalCalories}</h3>

      {/* Daily Goal Progress */}
      <h3>Daily Calories Goal: {dailyGoal} kcal</h3>
      <div style={{
        width:"100%", height:"25px", borderRadius:"12px",
        overflow:"hidden", backgroundColor: darkMode ? "#333" : "#eee",
        marginBottom:"10px"
      }}>
        <div style={{
          width:`${progress}%`, height:"100%",
          background: progress < 100 ? "linear-gradient(90deg,#4caf50,#8bc34a)" : "linear-gradient(90deg,#f44336,#e57373)",
          transition:"width 0.5s"
        }}></div>
      </div>
      <p>{Math.round(progress)}% of goal reached</p>
      <input
        type="number" value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))}
        placeholder="Set daily calories goal"
        style={{marginTop:"10px", padding:"5px"}}
      />

      {/* API Food Search */}
      <div style={{marginTop:"30px"}}>
        <h3>Search Food Database</h3>
        <input placeholder="Search food" value={apiFood} onChange={e=>setApiFood(e.target.value)}
          style={{marginRight:"5px", padding:"5px"}}/>
        <button onClick={searchFood} style={{
          padding:"5px 10px", borderRadius:"6px", border:"none",
          cursor:"pointer", backgroundColor:"#ff5722", color:"#fff"
        }}>Search</button>

        <div style={{marginTop:"20px"}}>
          {apiResults.map((f,i)=>(
            <div key={i} style={{
              background: darkMode ? "#222" : "#f9f9f9", borderRadius:"12px",
              padding:"10px", marginBottom:"10px", boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.1)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              transition:"transform 0.2s"
            }}>
              <div>
                <strong>{f.name}</strong>
                <div style={{fontSize:"12px"}}>
                  Calories: {Math.round(f.calories)}, P:{Math.round(f.protein_g)}g C:{Math.round(f.carbohydrates_total_g)}g F:{Math.round(f.fat_total_g)}g
                </div>
              </div>
              <button onClick={()=>{
                const newFood = {
                  id: Date.now(),
                  name:f.name,
                  calories:Math.round(f.calories),
                  protein:Math.round(f.protein_g),
                  carbs:Math.round(f.carbohydrates_total_g),
                  fat:Math.round(f.fat_total_g)
                };
                setFoods([...foods,newFood]);
              }}>Add</button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Food Entry */}
      <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginTop:"20px"}}>
        <input placeholder="Food" value={food} onChange={e=>setFood(e.target.value)} />
        <input placeholder="Calories" type="number" value={calories} onChange={e=>setCalories(e.target.value)} />
        <input placeholder="Protein (g)" type="number" value={protein} onChange={e=>setProtein(e.target.value)} />
        <input placeholder="Carbs (g)" type="number" value={carbs} onChange={e=>setCarbs(e.target.value)} />
        <input placeholder="Fat (g)" type="number" value={fat} onChange={e=>setFat(e.target.value)} />
        <button onClick={addFood} style={{
          backgroundColor:"#ff9800", color:"#fff", border:"none", padding:"8px 14px", borderRadius:"10px", cursor:"pointer"
        }}>Add</button>
      </div>

      {/* Local Search */}
      <input placeholder="Search food..." value={search} onChange={e=>setSearch(e.target.value)}
        style={{marginTop:"20px", padding:"5px"}}/>

      {/* Foods List */}
      <div style={{marginTop:"30px"}}>
        {foods.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).map(f=>(
          <div key={f.id} style={{
            background: darkMode ? "linear-gradient(135deg,#333,#111)" : "linear-gradient(135deg,#fff,#f0f0f0)",
            borderRadius:"12px", padding:"15px", marginBottom:"10px", boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.6)" : "0 4px 12px rgba(0,0,0,0.1)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            transition:"transform 0.2s"
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)"}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
            <div>
              <strong>{f.name}</strong> — {f.calories} kcal  
              <div style={{fontSize:"12px", marginTop:"4px", color: darkMode ? "#aaa" : "#555"}}>
                P:{f.protein}g C:{f.carbs}g F:{f.fat}g
              </div>
            </div>
            <button style={{background:"none", border:"none", fontSize:"18px", cursor:"pointer"}} onClick={()=>deleteFood(f.id)}>❌</button>
          </div>
        ))}
      </div>

      {/* Nutrition Chart */}
      {foods.length > 0 && (
        <>
          <h2 style={{marginTop:"40px"}}>Nutrition Breakdown 📊</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Protein" stackId="a" fill="#81c784" />
              <Bar dataKey="Carbs" stackId="a" fill="#64b5f6" />
              <Bar dataKey="Fat" stackId="a" fill="#ffb74d" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

    </div>
  );
}

export default App;