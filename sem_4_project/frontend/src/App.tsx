import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import CleaningDemo from "./pages/CleaningDemo";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">

        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-8">

          <Routes>

            {/* Main Dashboard */}
            <Route path="/" element={<Home />} />

            {/* Analytics Page */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Data Cleaning Demo */}
            <Route path="/cleaning" element={<CleaningDemo />} />

            {/* About Project */}
            <Route path="/about" element={<About />} />

          </Routes>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;