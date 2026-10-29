import { useEffect } from 'react';
import { realtimeSync } from '../services/realtime';

export function useCatalogSync(onUpdate: () => void, deps: any[] = []) {
  useEffect(() => {
    // Listen to real-time events from SSE
    const unsubscribe = realtimeSync.subscribe((event) => {
      // Trigger update on catalog modifications or periodic sync ticks
      if (
        event.type === 'PRODUCT_UPDATED' ||
        event.type === 'PRODUCT_CREATED' ||
        event.type === 'PRODUCT_DELETED' ||
        event.type === 'PRICE_CHANGED' ||
        event.type === 'STOCK_CHANGED' ||
        event.type === 'TAB_FOCUSED'
      ) {
        onUpdate();
      }
    });

    // Also listen to window custom event
    const handleWindowEvent = () => {
      onUpdate();
    };
    window.addEventListener('vk_catalog_updated', handleWindowEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('vk_catalog_updated', handleWindowEvent);
    };
  }, deps);
}
