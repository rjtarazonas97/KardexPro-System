import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Login from "./Login";
import Kardex from "./Kardex"; 
import Compras from "./Compras"; 
import Ventas from "./Ventas"; // <-- Importamos la pantalla de Ventas

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? "bg-indigo-700 text-white shadow-inner" 
          : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAutenticado(true);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setAutenticado(false);
  };

  if (!autenticado) {
    return <Login setAutenticado={setAutenticado} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans">
        
        {/* Navbar Moderno */}
        <nav className="bg-gradient-to-r from-indigo-900 to-indigo-800 shadow-lg border-b border-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-wide">
                  Kardex<span className="text-indigo-300">Pro</span>
                </h1>
              </div>

              <div className="flex items-center gap-2 md:gap-6">
                <div className="hidden md:flex space-x-2">
                  <NavLink to="/">Mi Kardex</NavLink>
                  <NavLink to="/compras">Compras</NavLink>
                  <NavLink to="/ventas">Ventas</NavLink>
                </div>
                
                <div className="hidden md:block h-6 w-px bg-indigo-700 mx-2"></div>

                <button 
                  onClick={cerrarSesion} 
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-rose-500/30 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenedor Principal */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Kardex />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/ventas" element={<Ventas />} />
            </Routes>
          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;