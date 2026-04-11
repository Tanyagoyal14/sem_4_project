import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"

import Layout from "./components/Layout"

import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import History from "./pages/History"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"

// ✅ No default export here
function CustomCursor(){

  useEffect(() => {
    const cursor = document.createElement("div")
    cursor.className = "custom-cursor"
    document.body.appendChild(cursor)

    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px"
      cursor.style.top = e.clientY + "px"
    })
  }, [])

  return null
}

function App(){
  return(
    <BrowserRouter>

      {/* 👇 IMPORTANT: Use your cursor */}
      <CustomCursor />

      <Routes>

        <Route path="/" element={<Landing/>}/>

        <Route path="/app" element={<Layout/>}>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="analytics" element={<Analytics/>}/> {/* FIXED */}
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