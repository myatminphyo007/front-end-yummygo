import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import initFx from "./utils/fx"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Stalls from "./pages/Stalls"
import ShopDetail from "./pages/ShopDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MyReservations from "./pages/MyReservations"
import Stamps from "./pages/Stamps"
import Profile from "./pages/Profile"
import OwnerDashboard from "./pages/OwnerDashboard"
import Admin from "./pages/Admin"
import Ticket from "./pages/Ticket"
import Stats from "./pages/Stats"
import FestivalPage from "./pages/FestivalPage"

export default function App() {
    return (
        <>
            <Navbar />
            <main id="app">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/stalls" element={<Stalls />} />
                    <Route path="/festival/:id" element={<FestivalPage />} />
                    <Route path="/shop/:id" element={<ShopDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-reservations"
                        element={
                            <ProtectedRoute role="customer">
                                <MyReservations />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stamps"
                        element={
                            <ProtectedRoute role="customer">
                                <Stamps />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute role="owner">
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ticket/:code"
                        element={
                            <ProtectedRoute role="owner">
                                <Ticket />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute role="admin">
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            <ProtectedRoute role="owner">
                                <Stats />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                
            </main>
            <Footer />
        </>
    )
}