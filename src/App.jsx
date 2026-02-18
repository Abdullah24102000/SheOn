import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home'; 
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-black selection:bg-hot-pink selection:text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Home />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin2410" element={<AdminDashboard />} />
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center text-white">
                <h1 className="text-2xl font-black italic">404 | NOT FOUND</h1>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;