import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import "./App.css"; // Styles globaux (optionnel)

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Route pour la page d'accueil */}
            <Route path="/" element={<HomePage />} />
            
            {/* Route dynamique pour les profils */}
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;