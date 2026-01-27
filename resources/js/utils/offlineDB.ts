// resources/js/utils/offlineDB.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ERPOfflineDB extends DBSchema {
  invoices: {
    key: string;
    value: {
      local_id: string;
      sequence_block_id: number;
      sequential: string;
      customer_id: number;
      establishment_id: number;
      emission_point_id: number;
      items: Array<{
        main_code: string;
        description: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
        taxes: Array<{ code: string; rate: number; amount: number }>;
        total: number;
      }>;
      subtotal: number;
      tax: number;
      total: number;
      generated_at: string;
      offline: boolean;
      device_id: string;
    };
  };
  sync_queue: {
    key: string;
    value: {
      local_id: string;
      invoice_data: any;
      created_at: string;
      retry_count: number;
    };
  };
  sequence_blocks: {
    key: number;
    value: {
      id: number;
      establishment_id: number;
      emission_point_id: number;
      from_number: number;
      to_number: number;
      current_number: number;
      status: string;
      device_id: string;
    };
  };
}

class OfflineDatabase {
  private db: IDBPDatabase<ERPOfflineDB> | null = null;

  async init() {
    this.db = await openDB<ERPOfflineDB>('erp_offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('invoices')) {
          db.createObjectStore('invoices', { keyPath: 'local_id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'local_id' });
        }
        if (!db.objectStoreNames.contains('sequence_blocks')) {
          db.createObjectStore('sequence_blocks', { keyPath: 'id' });
        }
      },
    });
  }

  async saveInvoice(invoice: ERPOfflineDB['invoices']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('invoices', invoice);
  }

  async getInvoices() {
    if (!this.db) await this.init();
    return await this.db!.getAll('invoices');
  }

  async addToSyncQueue(invoice: ERPOfflineDB['invoices']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('sync_queue', {
      local_id: invoice.local_id,
      invoice_data: invoice,
      created_at: new Date().toISOString(),
      retry_count: 0,
    });
  }

  async getSyncQueue() {
    if (!this.db) await this.init();
    return await this.db!.getAll('sync_queue');
  }

  async removeFromSyncQueue(localId: string) {
    if (!this.db) await this.init();
    await this.db!.delete('sync_queue', localId);
  }

  async saveSequenceBlock(block: ERPOfflineDB['sequence_blocks']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('sequence_blocks', block);
  }

  async getSequenceBlock(id: number) {
    if (!this.db) await this.init();
    return await this.db!.get('sequence_blocks', id);
  }

  async updateSequenceBlockCurrent(id: number, current: number) {
    if (!this.db) await this.init();
    const block = await this.getSequenceBlock(id);
    if (block) {
      block.current_number = current;
      await this.db!.put('sequence_blocks', block);
    }
  }
}

export const offlineDB = new OfflineDatabase();
