type EventMap = {
  "order_placed": { orderId: number; total: number };
  "system_alert": { severity: string; message: string };
};

class EventEmitter { 
  private listeners: { [K in keyof EventMap]?: Array<(data: EventMap[K]) => void> } = {};

  subscribe<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    (this.listeners[event] as Array<(data: EventMap[K]) => void>).push(callback);
    return () => {
      const current = this.listeners[event];
      if (current) {
        (this.listeners[event] as any) = current.filter(cb => cb !== callback);
      }
      console.log(`[System]: Unsubscribed from "${event}"`);
    };
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
}