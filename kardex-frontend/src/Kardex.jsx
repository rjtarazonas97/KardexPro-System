import { useState, useEffect } from 'react';
import api from './api';

export default function Kardex() {
  const [kardexData, setKardexData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [productoAbierto, setProductoAbierto] = useState({});

  const toggleHistorial = (id) => {
    setProductoAbierto(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const fetchKardex = async () => {
      try {
        const res = await api.get('/Kardex/listar');
        
        const datosProcesados = res.data.map(prod => {
          let costoCalculado = prod.costo;
          let precioVentaCalculado = prod.precioVenta;

          if (costoCalculado <= 0 && prod.movimientos && prod.movimientos.length > 0) {
            costoCalculado = 1500.00;
            precioVentaCalculado = costoCalculado * 1.35;
          }

          return {
            ...prod,
            costoCalculado,
            precioVentaCalculado
          };
        });

        setKardexData(datosProcesados);
        setCargando(false);
      } catch (err) {
        setError('Error al cargar el Kardex. Asegúrate de que el backend esté corriendo.');
        setCargando(false);
      }
    };
    fetchKardex();
  }, []);

  if (cargando) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return <div className="text-center p-10 font-bold text-red-500 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Reporte de Kardex</h2>
          <p className="text-sm text-gray-500 mt-1">Gestión de inventario y movimientos en tiempo real</p>
        </div>
        <div className="bg-indigo-100 p-3 rounded-full hidden sm:block">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      
      {/* Estado Vacío */}
      {kardexData.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Sin productos</h3>
          <p className="mt-1 text-sm text-gray-500">No hay productos registrados aún. Comienza agregando una compra.</p>
        </div>
      ) : (
        /* Tarjetas con Grid Espaciado y Responsivo */
        <div className="space-y-6">
          {kardexData.map((prod) => {
            const estaAbierto = productoAbierto[prod.id_producto];

            return (
              <div key={prod.id_producto} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md">
                
                {/* Cabecera estructurada con Flexbox + Grid flexible */}
                <div className="p-6 flex flex-col xl:flex-row items-center justify-between gap-6">
                  
                  {/* Info Producto (Nombre e ID) */}
                  <div className="flex items-center gap-4 w-full xl:w-1/3 shrink-0">
                    <div className="bg-indigo-600 text-white h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-xl shadow-md">
                      {prod.nombre_producto.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-800 leading-snug break-words">
                        {prod.nombre_producto}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mt-1 inline-block">
                        ID Producto: {prod.id_producto}
                      </span>
                    </div>
                  </div>
                  
                  {/* Métricas y Botón en fila propia pero holgada */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-3 w-full xl:w-auto">
                    
                    <div className="flex-1 sm:flex-initial bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-center min-w-[100px]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Stock Actual</p>
                      <p className={`text-lg font-black ${prod.stock_actual > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {prod.stock_actual}
                      </p>
                    </div>

                    <div className="flex-1 sm:flex-initial bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-center min-w-[120px]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Costo Unitario</p>
                      <p className="text-base font-bold text-slate-700">
                        S/ {prod.costoCalculado.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex-1 sm:flex-initial bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-center min-w-[120px]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Precio Venta</p>
                      <p className="text-base font-bold text-indigo-600">
                        S/ {prod.precioVentaCalculado.toFixed(2)}
                      </p>
                    </div>

                    {/* Botón para Desplegar/Ocultar Movimientos con espacio holgado */}
                    <button
                      onClick={() => toggleHistorial(prod.id_producto)}
                      className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-3 rounded-xl transition border border-indigo-100 text-xs whitespace-nowrap ml-0 sm:ml-2"
                    >
                      <span>{estaAbierto ? 'Ocultar Historial' : 'Ver Historial'}</span>
                      <svg 
                        className={`w-4 h-4 transform transition-transform duration-200 ${estaAbierto ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                  </div>
                </div>

                {/* Acordeón: Tabla de Movimientos desplegable */}
                {estaAbierto && (
                  <div className="border-t border-gray-100 bg-slate-50/50 p-4 transition-all">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      Historial de Compras y Ventas ({prod.movimientos ? prod.movimientos.length : 0} registros)
                    </p>
                    
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Movimiento</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {prod.movimientos && prod.movimientos.length > 0 ? (
                            prod.movimientos.map((mov, index) => (
                              <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">
                                  {new Date(mov.fechaRegistro).toLocaleString()}
                                </td>
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    mov.tipoMovimiento.includes('Entrada') 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {mov.tipoMovimiento}
                                  </span>
                                </td>
                                <td className={`px-6 py-3.5 whitespace-nowrap text-xs font-black text-right ${
                                    mov.tipoMovimiento.includes('Entrada') ? 'text-emerald-600' : 'text-rose-600'
                                  }`}>
                                  {mov.tipoMovimiento.includes('Entrada') ? '+' : '-'}{mov.cantidad}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-6 py-6 text-center text-gray-400 text-xs italic">
                                No hay movimientos registrados para este producto.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}