import { useState } from 'react';
import api from './api';

export default function Login({ setAutenticado }) {
  const [usuario, setUsuario] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/Auth/login', { usuario, password });
      localStorage.setItem('token', res.data.token);
      setAutenticado(true);
    } catch (err) {
      setError('Credenciales incorrectas o el servidor está apagado.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* Lado Izquierdo - Panel de Diseño (Oculto en celulares) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-3xl font-bold tracking-wider">KardexPro</span>
        </div>
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">¡Hola, Bienvenido!</h1>
        <p className="text-indigo-200 text-lg mb-8 max-w-md">
          Gestiona tu inventario, registra compras y controla tus ventas en tiempo real. Un sistema optimizado para tu negocio, creado por Jesus Tarazona.
        </p>
      </div>

      {/* Lado Derecho - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="bg-white p-10 rounded-3xl shadow-xl lg:shadow-none w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Iniciar Sesión</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Ingresa con tu cuenta de administrador.</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-semibold mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="text" 
                placeholder="Usuario"
                className="w-full px-6 py-4 border border-gray-200 rounded-full outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-gray-50 text-gray-700" 
                value={usuario} 
                onChange={e => setUsuario(e.target.value)} 
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña"
                className="w-full px-6 py-4 border border-gray-200 rounded-full outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-gray-50 text-gray-700" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            
            <div className="flex justify-end">
              <a href="#" className="text-sm text-indigo-500 hover:text-indigo-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-full hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-indigo-500/30"
            >
              Ingresar al Sistema
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}