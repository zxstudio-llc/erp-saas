// resources/js/Pages/Invoices/Create.tsx

import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useOfflineInvoice } from '@/hooks/useOfflineInvoice';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Props {
  sequenceBlocks: Array<{
    id: number;
    establishment_id: number;
    emission_point_id: number;
    from_number: number;
    to_number: number;
    current_number: number;
  }>;
}

export default function CreateInvoice({ sequenceBlocks }: Props) {
  const { isOnline, createInvoice } = useOfflineInvoice();
  const { data, setData, post, processing } = useForm({
    company_id: 1,
    customer_id: 0,
    establishment_id: 0,
    emission_point_id: 0,
    sequence_block_id: 0,
    items: [{
      main_code: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      subtotal: 0,
      taxes: [{ code: '2', rate: 15, amount: 0 }],
      total: 0,
    }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      // Modo offline - usar IndexedDB
      await createInvoice(data);
      alert('Factura guardada offline. Se sincronizará cuando haya conexión.');
    } else {
      // Modo online - enviar al backend
      post('/invoices');
    }
  };

  const addItem = () => {
    setData('items', [...data.items, {
      main_code: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      subtotal: 0,
      taxes: [{ code: '2', rate: 15, amount: 0 }],
      total: 0,
    }]);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nueva Factura" />
      
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-4 p-4 rounded bg-gray-100">
          <span className={`font-semibold ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          {!isOnline && (
            <p className="text-sm text-gray-600 mt-1">
              Las facturas se guardarán localmente y se sincronizarán automáticamente cuando haya conexión.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-2xl font-bold mb-6">Nueva Factura</h2>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bloque de Secuencia
            </label>
            <select
              value={data.sequence_block_id}
              onChange={e => setData('sequence_block_id', Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar</option>
              {sequenceBlocks.map(block => (
                <option key={block.id} value={block.id}>
                  {`${String(block.establishment_id).padStart(3, '0')}-${String(block.emission_point_id).padStart(3, '0')} (${block.current_number} - ${block.to_number})`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Items</h3>
            {data.items.map((item, index) => (
              <div key={index} className="border p-4 rounded mb-3">
                <input
                  type="text"
                  placeholder="Descripción"
                  value={item.description}
                  onChange={e => {
                    const items = [...data.items];
                    items[index].description = e.target.value;
                    setData('items', items);
                  }}
                  className="w-full border rounded px-3 py-2 mb-2"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={item.quantity}
                    onChange={e => {
                      const items = [...data.items];
                      items[index].quantity = Number(e.target.value);
                      items[index].subtotal = items[index].quantity * items[index].unit_price;
                      items[index].taxes[0].amount = items[index].subtotal * 0.15;
                      items[index].total = items[index].subtotal + items[index].taxes[0].amount;
                      setData('items', items);
                    }}
                    className="border rounded px-3 py-2"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={item.unit_price}
                    onChange={e => {
                      const items = [...data.items];
                      items[index].unit_price = Number(e.target.value);
                      items[index].subtotal = items[index].quantity * items[index].unit_price;
                      items[index].taxes[0].amount = items[index].subtotal * 0.15;
                      items[index].total = items[index].subtotal + items[index].taxes[0].amount;
                      setData('items', items);
                    }}
                    className="border rounded px-3 py-2"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    value={item.subtotal.toFixed(2)}
                    readOnly
                    className="border rounded px-3 py-2 bg-gray-50"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 hover:text-blue-800"
            >
              + Agregar Item
            </button>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
          >
            {processing ? 'Guardando...' : 'Emitir Factura'}
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
