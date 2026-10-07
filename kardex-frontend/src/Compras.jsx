import { useState, useEffect } from 'react';
import api from './api';

export default function Compras() {
  const [productos, setProductos] = useState([]);
  const [idProducto, setIdProducto] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [esNuevoProducto, setEsNuevoProducto] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [costo, setCosto] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [guardando, setGuardando] = useState(false);

  // Cargar la lista de productos
  const cargarProductos = async () => {
    try {
      const res = await api.get('/Producto/listar');
      setProductos(res.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleSeleccionarProducto = (e) => {
    const val = e.target.value;
    if (val === 'NUEVO') {
      setEsNuevoProducto(true);
      setIdProducto('');
      setNombreProducto('');
      setCosto('');
    } else {
      setEsNuevoProducto(false);
      setIdProducto(val);
      const prodEncontrado = productos.find(p => p.id_producto === parseInt(val));
      if (prodEncontrado) {
        setNombreProducto(prodEncontrado.nombre_producto);
        setCosto(prodEncontrado.costo > 0 ? prodEncontrado.costo : '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!costo || parseFloat(costo) <= 0 || !cantidad || parseInt(cantidad) <= 0) {
      setMensaje({ tipo: 'error', texto: 'Por favor ingresa una cantidad y costo válidos.' });
      return;
    }

    setGuardando(true);

    try {
      let prodIdActual = idProducto;
      const nuevoCosto = parseFloat(costo);
      const nuevoPrecioVenta = nuevoCosto * 1.35; // Margen del 35%

      if (esNuevoProducto) {
        // 1. Si es producto nuevo, lo creamos
        if (!nombreProducto.trim()) {
          setMensaje({ tipo: 'error', texto: 'El nombre del producto es obligatorio.' });
          setGuardando(false);
          return;
        }

        const resProd = await api.post('/Producto/registrar', {
          nombre_producto: nombreProducto,
          costo: nuevoCosto,
          precioVenta: nuevoPrecioVenta
        });

        prodIdActual = resProd.data.id_producto;
      } else {
        // 2. Si es producto existente, actualizamos su costo y precio de venta en la BD
        await api.put(`/Producto/actualizar/${prodIdActual}`, {
          nombre_producto: nombreProducto,
          costo: nuevoCosto,
          precioVenta: nuevoPrecioVenta
        });
      }

      // 3. Registrar la Compra en el Kardex
      const payloadCompra = {
        detalles: [
          {
            id_producto: parseInt(prodIdActual),
            cantidad: parseInt(cantidad),
            costoUnitario: nuevoCosto
          }
        ]
      };

      await api.post('/Compra/registrar', payloadCompra);

      setMensaje({ tipo: 'exito', texto: '¡Compra registrada! Costo, precio de venta y stock actualizados.' });
      
      setCantidad(1);
      setCosto('');
      setNombreProducto('');
      setIdProducto('');
      setEsNuevoProducto(false);
      cargarProductos();

    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al procesar la compra.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Módulo de Compras</h2>
          <p className="text-sm text-gray-500 mt-1">Registra la entrada de productos e incrementa el stock general.</p>
        </div>
        <div className="bg-emerald-100 p-3 rounded-2xl hidden sm:block">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Producto</label>
            <select
              value={esNuevoProducto ? 'NUEVO' : idProducto}
              onChange={handleSeleccionarProducto}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-medium"
            >
              <option value="">-- Selecciona un producto existente --</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre_producto} (Costo actual: S/ {p.costo.toFixed(2)})
                </option>
              ))}
              <option value="NUEVO" className="font-bold text-indigo-600">+ Registrar Nuevo Producto...</option>
            </select>
          </div>

          {esNuevoProducto && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-sm font-bold text-indigo-900 mb-2">Nombre del Nuevo Producto</label>
              <input
                type="text"
                placeholder="Ej. Teclado Mecánico RGB"
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad a Ingresar</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Costo Unitario de Compra (S/)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 1500.00"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 text-gray-700 font-bold"
              />
            </div>
          </div>

          {costo > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
              <span className="text-gray-600">Nuevo Precio de Venta Calculado (+35%):</span>
              <span className="font-extrabold text-indigo-600 text-base">
                S/ {(parseFloat(costo) * 1.35).toFixed(2)}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {guardando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Procesar y Registrar Compra
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}