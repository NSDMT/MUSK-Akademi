import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public site
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Branches from './pages/Branches';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Athletes from './pages/Athletes';
import './pages/Home.css';

// Panel
import PanelLogin from './pages/panel/Login';
import './pages/panel/Login.css';

// Admin
import AdminDashboard from './pages/panel/admin/Dashboard';
import AdminStudents from './pages/panel/admin/Students';
import AdminUsers from './pages/panel/admin/Users';
import AdminGroups from './pages/panel/admin/Groups';
import AdminSchedule from './pages/panel/admin/Schedule';
import AdminDues from './pages/panel/admin/Dues';
import AdminApplications from './pages/panel/admin/Applications';
import AdminSponsors from './pages/panel/admin/Sponsors';
import AdminNews from './pages/panel/admin/News';
import AdminGallery from './pages/panel/admin/Gallery';

// Coach
import CoachDashboard from './pages/panel/coach/Dashboard';

// Parent
import ParentDashboard from './pages/panel/parent/Dashboard';
import ParentPassword from './pages/panel/parent/Password';
import PaymentReturn from './pages/panel/PaymentReturn';

function PublicSite() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hakkimizda" element={<About />} />
        <Route path="/branslar" element={<Branches />} />
        <Route path="/haberler" element={<News />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/kayit" element={<Register />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/sporcularimiz" element={<Athletes />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Panel routes — no Navbar/Footer */}
          <Route path="/panel/login" element={<PanelLogin />} />

          <Route path="/panel/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/panel/admin/students" element={
            <ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>
          } />
          <Route path="/panel/admin/users" element={
            <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/panel/admin/groups" element={
            <ProtectedRoute roles={['admin']}><AdminGroups /></ProtectedRoute>
          } />
          <Route path="/panel/admin/schedule" element={
            <ProtectedRoute roles={['admin']}><AdminSchedule /></ProtectedRoute>
          } />
          <Route path="/panel/admin/dues" element={
            <ProtectedRoute roles={['admin']}><AdminDues /></ProtectedRoute>
          } />

          <Route path="/panel/admin/applications" element={
            <ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>
          } />

          <Route path="/panel/admin/sponsors" element={
            <ProtectedRoute roles={['admin']}><AdminSponsors /></ProtectedRoute>
          } />

          <Route path="/panel/admin/news" element={
            <ProtectedRoute roles={['admin']}><AdminNews /></ProtectedRoute>
          } />

          <Route path="/panel/admin/gallery" element={
            <ProtectedRoute roles={['admin']}><AdminGallery /></ProtectedRoute>
          } />

          <Route path="/panel/antrenor/dashboard" element={
            <ProtectedRoute roles={['antrenor', 'admin']}><CoachDashboard /></ProtectedRoute>
          } />

          <Route path="/panel/veli/dashboard" element={
            <ProtectedRoute roles={['veli', 'admin']}><ParentDashboard /></ProtectedRoute>
          } />

          <Route path="/panel/veli/sifre" element={
            <ProtectedRoute roles={['veli', 'admin']}><ParentPassword /></ProtectedRoute>
          } />

          <Route path="/panel/payment-return" element={
            <ProtectedRoute roles={['veli', 'admin']}><PaymentReturn /></ProtectedRoute>
          } />

          <Route path="/panel" element={<Navigate to="/panel/login" replace />} />

          {/* Public website */}
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

