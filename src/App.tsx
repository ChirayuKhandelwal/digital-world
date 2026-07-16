import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Cart } from "./pages/Cart";
import { Contact } from "./pages/Contact";
import { Profile } from "./pages/Profile";
import { DeliveryVerify } from "./pages/DeliveryVerify";
import { AppProvider } from "./context/AppContext";

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  
  useEffect(() => {
    setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo(0, 0);
    }, 50);
  }, [pathname, hash, state]);
  
  return null;
}

function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="cart" element={<Cart />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/delivery-verify" element={<DeliveryVerify />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
