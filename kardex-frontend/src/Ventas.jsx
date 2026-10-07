import { useState, useEffect } from 'react';
import api from './api';

export default function Ventas() {
  const [kardexProductos, setKardexProductos] = useState([]);
  const [idProducto, setIdProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioManual, setPrecioManual] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  const cargarCatalogo = async () => {
    try {
      const res = await api.get('/Kardex/listar');
      setKardexProductos(res.data);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const handleSeleccionarProducto = (e) => {
    const val = e.target.value;
    setIdProducto(val);
    setMensaje({ tipo: '', texto: '' });
    
    if (val) {
      const prod = kardexProductos.find(p => p.id_producto === parseInt(val));
      setProductoSeleccionado(prod || null);
      setPrecioManual(prod && prod.precioVenta > 0 ? prod.precioVenta : '');
    } else {
      setProductoSeleccionado(null);
      setPrecioManual('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!idProducto) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un producto.' });
      return;
    }

    const cantNum = parseInt(cantidad);
    const precioNum = parseFloat(precioManual);

    if (!cantNum || cantNum <= 0) {
      setMensaje({ tipo: 'error', texto: 'Ingresa una cantidad válida a vender.' });
      return;
    }

    if (!precioNum || precioNum <= 0) {
      setMensaje({ tipo: 'error', texto: 'El precio unitario de venta debe ser mayor a 0.' });
      return;
    }

    if (productoSeleccionado && cantNum > productoSeleccionado.stock_actual) {
      setMensaje({ 
        tipo: 'error', 
        texto: `Stock insuficiente. Solo dispones de ${productoSeleccionado.stock_actual} unidades.` 
      });
      return;
    }

    setGuardando(true);

    try {
      const payloadVenta = {
        detalles: [
          {
            id_producto: parseInt(idProducto),
            cantidad: cantNum,
            precioUnitario: precioNum
          }
        ]
      };

      await api.post('/Venta/registrar', payloadVenta);

      setMensaje({ tipo: 'exito', texto: '¡Venta registrada con éxito! Salida descontada del Kardex.' });
      
      setCantidad(1);
      setIdProducto('');
      setPrecioManual('');
      setProductoSeleccionado(null);
      cargarCatalogo();

    } catch (err) {
      console.error(err);
      setMensaje({ 
        tipo: 'error', 
        texto: err.response?.data?.message || 'Error al procesar la venta. Revisa el stock.' 
      });
    } finally {
      setGuardando(false);
    }
  };

  // Cálculo en vivo garantizado
  const cantValida = parseInt(cantidad) || 0;
  const precioValido = parseFloat(precioManual) || 0;
  const totalCalculado = (cantValida * precioValido).toFixed(2);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Módulo de Ventas</h2>
          <p className="text-sm text-gray-500 mt-1">Registra la salida de mercancía y descuenta el stock en tiempo real.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-2xl hidden sm:block">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl mb-6 font-semibold flex items-center gap-3 ${
          mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {mensaje.tipo === 'exito' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {mensaje.texto}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Producto a Vender</label>
            <select
              value={idProducto}
              onChange={handleSeleccionarProducto}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-medium"
            >
              <option value="">-- Selecciona un producto disponible --</option>
              {kardexProductos.map((p) => (
                <option key={p.id_producto} value={p.id_producto} disabled={p.stock_actual <= 0}>
                  {p.nombre_producto} (Stock: {p.stock_actual} | Precio BD: S/ {p.precioVenta.toFixed(2)}) {p.stock_actual <= 0 ? '- [SIN STOCK]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad a Vender</label>
              <input
                type="number"
                min="1"
                max={productoSeleccionado ? productoSeleccionado.stock_actual : 999}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Precio Unitario de Venta (S/)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 2000.00"
                value={precioManual}
                onChange={(e) => setPrecioManual(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-bold"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-xl text-right flex justify-between items-center">
            <span className="text-sm text-gray-400 font-bold uppercase">Total Cobro Estimado:</span>
            <span className="text-3xl font-black text-indigo-400">S/ {totalCalculado}</span>
          </div>

          <button
            type="submit"
            disabled={guardando || !idProducto}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-600/30 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {guardando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Procesar y Emitir Venta
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}