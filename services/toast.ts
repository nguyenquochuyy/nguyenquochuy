// Simple event-based toast system (no external deps)
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type Listener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: Listener[] = [];

  private notify() {
    this.listeners.forEach(l => l([...this.toasts]));
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toasts = [...this.toasts, { id, type, message, duration }];
    this.notify();
    setTimeout(() => this.dismiss(id), duration);
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  success(msg: string) { return this.show(msg, 'success'); }
  error(msg: string)   { return this.show(msg, 'error', 5000); }
  info(msg: string)    { return this.show(msg, 'info'); }
  warning(msg: string) { return this.show(msg, 'warning'); }
}

export const toast = new ToastService();
