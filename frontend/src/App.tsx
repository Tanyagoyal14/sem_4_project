import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"

import Layout from "./components/Layout"
import RequireAuth from "./components/RequireAuth"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import VideoComparison from "./pages/VideoComparison"
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
        <Route path="/login" element={<Login/>}/>

        <Route element={<RequireAuth/>}>
          <Route path="/app" element={<Layout/>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="compare" element={<VideoComparison/>}/>
            <Route path="analytics" element={<Analytics/>}/> {/* FIXED */}
            <Route path="history" element={<History/>}/>
            <Route path="reports" element={<Reports/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="profile" element={<Profile/>}/>
          </Route>
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
