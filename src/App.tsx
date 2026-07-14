import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Cart } from "./pages/Cart";
import { Contact } from "./pages/Contact";
import { AppProvider } from "./context/AppContext";

function ScrollToTop() {
  const { pathname, state } = useLocation();
  
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, [pathname, state]);
  
  return null;
}

function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="cart" element={<Cart />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;
