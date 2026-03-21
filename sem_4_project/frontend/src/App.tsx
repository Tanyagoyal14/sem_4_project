import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import History from "./pages/History"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"

function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing/>}/>

        <Route path="/app" element={<Layout/>}>

          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="/app/analytics" element={<Analytics/>}/>
          <Route path="history" element={<History/>}/>
          <Route path="reports" element={<Reports/>}/>
          <Route path="settings" element={<Settings/>}/>
          <Route path="profile" element={<Profile/>}/>

        </Route>

      </Routes>

    </BrowserRouter>

  )

}

export default App