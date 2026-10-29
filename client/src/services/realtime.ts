/**
 * Real-time Live Catalog Synchronization for VK Technology
 * Listens to Server-Sent Events (SSE) from /api/events and broadcasts
 * live updates across all open tabs, windows, and devices.
 * Includes automatic reconnect and visibility-based polling fallback.
 */

type CatalogUpdateListener = (event: { type: string; data: any }) => void;

class RealtimeSyncManager {
  private eventSource: EventSource | null = null;
  private listeners: Set<CatalogUpdateListener> = new Set();
  private reconnectTimer: any = null;
  private pollTimer: any = null;
  private isConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    this.connect();

    // Re-sync when user switches back to this browser tab
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.notify('TAB_FOCUSED', {});
        if (!this.isConnected) {
          this.connect();
        }
      }
    });

    // Background polling fallback every 25 seconds
    this.pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.notify('POLL_TICK', {});
      }
    }, 25000);
  }

  private connect() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
    }

    const apiBase = (import.meta as any).env?.VITE_API_URL || '/api';
    const streamUrl = `${apiBase}/events`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type && payload.type !== 'CONNECTED') {
            this.notify(payload.type, payload.data);
          }
        } catch (err) {
          console.warn('[Realtime] Parse error:', err);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        try {
          this.eventSource?.close();
        } catch {}
        this.eventSource = null;

        // Auto-reconnect with backoff
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 5000);
        }
      };
    } catch (err) {
      this.isConnected = false;
    }
  }

  subscribe(listener: CatalogUpdateListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(type: string, data: any) {
    // Notify all in-memory subscribers
    this.listeners.forEach((fn) => {
      try {
        fn({ type, data });
      } catch (e) {
        console.error('[Realtime] Listener callback error:', e);
      }
    });

    // Also dispatch a browser-wide DOM event
    try {
      window.dispatchEvent(
        new CustomEvent('vk_catalog_updated', {
          detail: { type, data, timestamp: Date.now() }
        })
      );
    } catch {}
  }
}

export const realtimeSync = new RealtimeSyncManager();
