import { Response } from 'express';

export type EventType =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRICE_CHANGED'
  | 'STOCK_CHANGED'
  | 'CATEGORY_UPDATED'
  | 'BANNER_UPDATED'
  | 'ORDER_STATUS_CHANGED'
  | 'SETTINGS_UPDATED';

interface Client {
  id: string;
  res: Response;
}

class EventBroadcaster {
  private clients: Map<string, Response> = new Map();

  addClient(id: string, res: Response) {
    this.clients.set(id, res);
    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId: id, timestamp: new Date().toISOString() })}\n\n`);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  broadcast(type: EventType, data: any) {
    const payload = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    for (const [id, res] of this.clients.entries()) {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const eventBroadcaster = new EventBroadcaster();
