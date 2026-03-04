import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Landing page */}

        <Route path="/" element={<Landing />} />

        {/* Dashboard layout */}

        <Route path="/app" element={<Layout />}>

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;