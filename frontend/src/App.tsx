import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateGame from "./pages/CreateGame";
import Game from "./pages/dashboard/Game";
import Folder from "./pages/dashboard/Folder";
import Flashcard from "./pages/dashboard/Flashcard";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/dashboard/game" element={<Game />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard/folder" element={<Folder />} />
          <Route path="/dashboard/flashcard" element={<Flashcard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
