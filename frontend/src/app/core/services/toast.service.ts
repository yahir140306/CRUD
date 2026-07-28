import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = ++this.counter;
    const newToast: Toast = { id, message, type };
    
    this.toasts.update(current => [...current, newToast]);

    // Remover automáticamente después de 3 segundos
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
