import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import PageLoader from './components/common/PageLoader'
import RouteLoader from './components/common/RouteLoader'

// ── Pages Publiques ──────────────────────────────────────────────
const Home        = lazy(() => import('./pages/public/Home'))
const Login       = lazy(() => import('./pages/public/Login'))
const Register    = lazy(() => import('./pages/public/Register'))
const EventDetail = lazy(() => import('./pages/public/EventDetail'))
const Reservation = lazy(() => import('./pages/public/Reservation'))
const NotFound    = lazy(() => import('./pages/public/NotFound'))
const ServerError = lazy(() => import('./pages/public/ServerError'))
const CompteBloque = lazy(() => import('./pages/public/CompteBloque'))

// ── Admin ────────────────────────────────────────────────────────
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers       = lazy(() => import('./pages/admin/Users'))
const AdminEvenements  = lazy(() => import('./pages/admin/Evenements'))
const AdminLogs        = lazy(() => import('./pages/admin/Logs'))

// ── Shared ───────────────────────────────────────────────────────
const EvenementsActifs = lazy(() => import('./pages/shared/EvenementsActifs'))

// ── Organisateur ─────────────────────────────────────────────────
const OrgDashboard  = lazy(() => import('./pages/organisateur/Dashboard'))
const OrgEvenements = lazy(() => import('./pages/organisateur/Evenements'))
const OrgAgents     = lazy(() => import('./pages/organisateur/Agents'))
const OrgScans      = lazy(() => import('./pages/organisateur/Scans'))

// ── Agent ────────────────────────────────────────────────────────
const AgentDashboard = lazy(() => import('./pages/agent/Dashboard'))
const AgentScanner   = lazy(() => import('./pages/agent/Scanner'))
const AgentEvenements = lazy(() => import('./pages/agent/EvenementsAssignes'))
const AgentHistorique = lazy(() => import('./pages/agent/Historique'))

// ── Participant ──────────────────────────────────────────────────
const MesTickets = lazy(() => import('./pages/participant/MesTickets'))
const Profil     = lazy(() => import('./pages/participant/Profil'))
const Parametres = lazy(() => import('./pages/participant/Parametres'))

// ── Guard ────────────────────────────────────────────────────────
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Suspense fallback={<PageLoader />}>
            <RouteLoader />
            <Routes>
              {/* Publiques */}
              <Route path="/"                    element={<Home />} />
              <Route path="/login"               element={<Login />} />
              <Route path="/register"            element={<Register />} />
              <Route path="/compte-bloque"        element={<CompteBloque />} />
              <Route path="/evenements/:id"      element={<EventDetail />} />
              <Route path="/reservation/:id"     element={<Reservation />} />

              {/* Admin */}
              <Route path="/admin" element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }/>
              <Route path="/admin/users" element={
                <PrivateRoute roles={['admin']}>
                  <AdminUsers />
                </PrivateRoute>
              }/>
              <Route path="/admin/evenements" element={
                <PrivateRoute roles={['admin']}>
                  <AdminEvenements />
                </PrivateRoute>
              }/>
              <Route path="/admin/logs" element={
                <PrivateRoute roles={['admin']}>
                  <AdminLogs />
                </PrivateRoute>
              }/>
              <Route path="/admin/evenements-actifs" element={
                <PrivateRoute roles={['admin']}>
                  <EvenementsActifs />
                </PrivateRoute>
              }/>
              <Route path="/admin/mes-tickets" element={
                <PrivateRoute roles={['admin']}>
                  <MesTickets />
                </PrivateRoute>
              }/>

              {/* Organisateur */}
              <Route path="/organisateur" element={
                <PrivateRoute roles={['organisateur']}>
                  <OrgDashboard />
                </PrivateRoute>
              }/>
              <Route path="/organisateur/evenements" element={
                <PrivateRoute roles={['organisateur']}>
                  <OrgEvenements />
                </PrivateRoute>
              }/>
              <Route path="/organisateur/agents" element={
                <PrivateRoute roles={['organisateur']}>
                  <OrgAgents />
                </PrivateRoute>
              }/>
              <Route path="/organisateur/scans" element={
                <PrivateRoute roles={['organisateur']}>
                  <OrgScans />
                </PrivateRoute>
              }/>
              <Route path="/organisateur/evenements-actifs" element={
                <PrivateRoute roles={['organisateur']}>
                  <EvenementsActifs />
                </PrivateRoute>
              }/>
              <Route path="/organisateur/mes-tickets" element={
                <PrivateRoute roles={['organisateur']}>
                  <MesTickets />
                </PrivateRoute>
              }/>

              {/* Agent */}
              <Route path="/agent" element={
                <PrivateRoute roles={['agent']}>
                  <AgentDashboard />
                </PrivateRoute>
              }/>
              <Route path="/agent/scanner" element={
                <PrivateRoute roles={['agent']}>
                  <AgentScanner />
                </PrivateRoute>
              }/>
              <Route path="/agent/evenements" element={
                <PrivateRoute roles={['agent']}>
                  <AgentEvenements />
                </PrivateRoute>
              }/>
              <Route path="/agent/historique" element={
                <PrivateRoute roles={['agent']}>
                  <AgentHistorique />
                </PrivateRoute>
              }/>
              <Route path="/agent/mes-tickets" element={
                <PrivateRoute roles={['agent']}>
                  <MesTickets />
                </PrivateRoute>
              }/>

              {/* Participant */}
              <Route path="/mes-tickets" element={
                <PrivateRoute roles={['participant']}>
                  <MesTickets />
                </PrivateRoute>
              }/>
              <Route path="/profil" element={
                <PrivateRoute roles={['participant', 'admin', 'organisateur', 'agent']}>
                  <Profil />
                </PrivateRoute>
              }/>
              <Route path="/parametres" element={
                <PrivateRoute roles={['participant', 'admin', 'organisateur', 'agent']}>
                  <Parametres />
                </PrivateRoute>
              }/>

              {/* Erreurs */}
              <Route path="/500" element={<ServerError />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}