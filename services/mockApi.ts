import { Order, ActivityLog, Dispute, InventoryItem, RepricingItem } from '../types';

// Simulate Backend API Routes
export const apiRoutes = {
  auth: {
    login: '/api/auth/login',
    allegroAuth: '/api/allegro/auth',
  },
  webhooks: {
    allegro: '/api/allegro/webhook',
  },
  orders: {
    list: '/api/orders',
    updateStatus: '/api/orders/status',
  }
};

// Mock Data
export const mockOrders: Order[] = [
  {
    id: '1001',
    buyer: 'user@example.com',
    total: 149.99,
    status: 'new',
    date: '2023-10-25 14:30',
    carrier: 'inpost',
    products: [
      { id: 'p1', name: 'Słuchawki Bezprzewodowe PRO', sku: 'AUDIO-001', price: 149.99, stock: 50, image: 'placeholder' }
    ]
  },
  {
    id: '1002',
    buyer: 'anna.nowak_allegro',
    total: 2590.00,
    status: 'processing',
    date: '2023-10-25 13:15',
    carrier: 'dpd',
    products: [
      { id: 'p2', name: 'Smartfon Galaxy X', sku: 'PHONE-Samsung', price: 2590.00, stock: 12, image: 'placeholder' }
    ]
  },
  {
    id: '1003',
    buyer: 'firma_budowlana_x',
    total: 450.50,
    status: 'shipped',
    date: '2023-10-24 09:00',
    carrier: 'allegro_one',
    products: [
      { id: 'p3', name: 'Zestaw Wierteł Udarowych', sku: 'TOOLS-055', price: 450.50, stock: 100, image: 'placeholder' }
    ]
  }
];

export const mockMessages = [
  { id: 1, user: 'Klienciak_123', preview: 'Kiedy wyślecie paczkę?', time: '2 min temu', unread: true },
  { id: 2, user: 'Zadowolony_Klient', preview: 'Dzięki, wszystko super!', time: '15 min temu', unread: false },
  { id: 3, user: 'Pani_Basia', preview: 'Faktura jest błędna.', time: '1h temu', unread: true },
];

export const mockDisputes: Dispute[] = [
  { id: 'D-101', orderId: '1003', buyer: 'firma_budowlana_x', reason: 'damaged', status: 'opened', openedAt: '2023-10-24', daysRemaining: 2, autoResolveEnabled: true },
  { id: 'D-102', orderId: '9988', buyer: 'nerwowy_klient', reason: 'not_received', status: 'escalated', openedAt: '2023-10-20', daysRemaining: 1, autoResolveEnabled: false },
];

export const mockInventory: InventoryItem[] = [
  { id: 'I-1', name: 'Konsola Retro X', sku: 'RETRO-90', realStock: 5, virtualBuffer: 2, allegroStatus: 'active' },
  { id: 'I-2', name: 'Kabel HDMI 2.1', sku: 'CABLE-002', realStock: 2, virtualBuffer: 3, allegroStatus: 'ended' }, // Buffer > Stock -> Ended
  { id: 'I-3', name: 'Pad Bezprzewodowy', sku: 'PAD-WIFI', realStock: 150, virtualBuffer: 5, allegroStatus: 'active' },
];

export const mockRepricing: RepricingItem[] = [
  { id: 'R-1', name: 'Słuchawki PRO', myPrice: 139.00, competitorPrice: 135.00, competitorStock: 50, strategy: 'undercut', lastUpdate: '1 min temu' },
  { id: 'R-2', name: 'Zasilacz USB-C', myPrice: 89.00, competitorPrice: 75.00, competitorStock: 0, strategy: 'surge', lastUpdate: '15 sek temu' }, // Surge Example
];

export const mockFetchOrders = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders), 800);
  });
};

export const mockActivityFeed = async (): Promise<ActivityLog[]> => {
  return [
    { id: '1', type: 'ORDER', message: 'Nowe zamówienie: user@example.com (149.99 PLN)', timestamp: '2 min temu' },
    { id: '2', type: 'SYSTEM', message: 'Token API Allegro odświeżony pomyślnie', timestamp: '15 min temu' },
    { id: '3', type: 'MESSAGE', message: 'Autoresponder wysłał odpowiedź do Klienciak_123', timestamp: '1 godz. temu' },
    { id: '4', type: 'ERROR', message: 'Błąd synchronizacji stanu: SKU AUDIO-001', timestamp: '3 godz. temu' },
  ];
};