import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import initFx from "./utils/fx"
import Navbar from "./components/Navbar"
import WakeBanner from "./components/WakeBanner"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Stalls from "./pages/Stalls"
import ShopDetail from "./pages/ShopDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import MyReservations from "./pages/MyReservations"
import Stamps from "./pages/Stamps"
import Profile from "./pages/Profile"
import OwnerDashboard from "./pages/OwnerDashboard"
import Admin from "./pages/Admin"
import Ticket from "./pages/Ticket"
import Stats from "./pages/Stats"
import FestivalPage from "./pages/FestivalPage"
import Favorites from "./pages/Favorites"

export default function App() {
    useEffect(() => initFx(), [])

    return (
        <>
            <Navbar />
            <WakeBanner />
            <main id="app">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/stalls" element={<Stalls />} />
                    <Route path="/festival/:id" element={<FestivalPage />} />
                    <Route path="/shop/:id" element={<ShopDetail />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot" element={<ForgotPassword />} />

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
