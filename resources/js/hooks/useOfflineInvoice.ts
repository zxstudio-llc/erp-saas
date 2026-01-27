// resources/js/hooks/useOfflineInvoice.ts

import { useState, useCallback } from 'react';
import { offlineDB } from '@/utils/offlineDB';
import { v4 as uuidv4 } from 'uuid';
import { router } from '@inertiajs/react';

interface InvoiceData {
  company_id: number;
  customer_id: number;
  establishment_id: number;
  emission_point_id: number;
  sequence_block_id: number;
  items: Array<{
    main_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
    taxes: Array<{ code: string; rate: number; amount: number }>;
    total: number;
  }>;
}

export function useOfflineInvoice() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const deviceId = localStorage.getItem('device_id') || (() => {
    const id = uuidv4();
    localStorage.setItem('device_id', id);
    return id;
  })();

  // Listener para estado online/offline
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createInvoice = useCallback(async (data: InvoiceData) => {
    const block = await offlineDB.getSequenceBlock(data.sequence_block_id);
    
    if (!block) {
      throw new Error('Sequence block not found');
    }

    if (block.current_number >= block.to_number) {
      throw new Error('Sequence block exhausted');
    }

    const nextNumber = block.current_number + 1;
    const sequential = `${String(block.establishment_id).padStart(3, '0')}-${String(block.emission_point_id).padStart(3, '0')}-${String(nextNumber).padStart(9, '0')}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    const invoice = {
      local_id: uuidv4(),
      ...data,
      sequential,
      subtotal,
      tax,
      total,
      generated_at: new Date().toISOString(),
      offline: !isOnline,
      device_id: deviceId,
    };

    // Guardar en IndexedDB
    await offlineDB.saveInvoice(invoice);
    await offlineDB.updateSequenceBlockCurrent(block.id, nextNumber);

    if (!isOnline) {
      // Agregar a cola de sincronización
      await offlineDB.addToSyncQueue(invoice);
    } else {
      // Enviar inmediatamente
      router.post('/invoices', invoice);
    }

    return invoice;
  }, [isOnline, deviceId]);

  const syncOfflineInvoices = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    setIsSyncing(true);
    try {
      const queue = await offlineDB.getSyncQueue();
      
      if (queue.length === 0) {
        return { success: true, synced: 0 };
      }

      const response = await fetch('/sync/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          company_id: queue[0].invoice_data.company_id,
          invoices: queue.map(q => q.invoice_data),
        }),
      });

      if (response.ok) {
        // Limpiar cola exitosa
        for (const item of queue) {
          await offlineDB.removeFromSyncQueue(item.local_id);
        }
        return { success: true, synced: queue.length };
      } else {
        throw new Error('Sync failed');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, deviceId]);

  return {
    isOnline,
    isSyncing,
    createInvoice,
    syncOfflineInvoices,
  };
}
