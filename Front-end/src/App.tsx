import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LanguageContext'
import type { UserRole } from './context/AuthContext'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// Auth
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyOTPPage from './pages/auth/VerifyOTPPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Admin
import AdminOverview from './pages/admin/AdminOverview'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminMeals from './pages/admin/AdminMeals'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'
import AdminCommunity from './pages/admin/AdminCommunity'

// Restaurant
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard'
import RestaurantMeals from './pages/restaurant/RestaurantMeals'
import RestaurantOrders from './pages/restaurant/RestaurantOrders'

// Customer
import CustomerHome from './pages/customer/CustomerHome'
import CustomerRestaurants from './pages/customer/CustomerRestaurants'
import CustomerOrders from './pages/customer/CustomerOrders'
import CustomerReviews from './pages/customer/CustomerReviews'

// Shared
import ChatPage from './pages/shared/ChatPage'
import NotificationsPage from './pages/shared/NotificationsPage'
import ProfilePage from './pages/shared/ProfilePage'
import CommunityPage from './pages/shared/CommunityPage'
import PublicHome from './pages/PublicHome'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/:type" element={<SignupPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="meals" element={<AdminMeals />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Restaurant */}
      <Route path="/restaurant" element={<ProtectedRoute roles={['restaurant']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<RestaurantDashboard />} />
        <Route path="meals" element={<RestaurantMeals />} />
        <Route path="orders" element={<RestaurantOrders />} />
        <Route path="analytics" element={<RestaurantDashboard />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute roles={['customer']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<CustomerHome />} />
        <Route path="restaurants" element={<CustomerRestaurants />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Public home */}
      <Route path="/home" element={<PublicHome />} />

      {/* Root redirect */}
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/home" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
