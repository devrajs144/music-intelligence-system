import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Memory from "./pages/Memory";
import Bubble from "./pages/Bubble";
import NavBar from "./components/NavBar";
import Grain from "./components/Grain";
import NowPlayingBar from "./components/NowPlayingBar";
import { PlayerProvider } from "./context/PlayerContext";

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== "/";

  return (
    <>
      <Grain />
      {showNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/bubble" element={<Bubble />} />
      </Routes>
      <NowPlayingBar />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;
