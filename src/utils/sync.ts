import { db } from '../db';
import type { MealRecord } from '../types';

class SyncClient {
  private ws: WebSocket | null = null;
  private roomCode: string = '';
  private isConnected: boolean = false;
  private onStatusChangeListeners: ((status: boolean) => void)[] = [];

  constructor() {
    // Load or generate 6-digit persistent kitchen pairing code
    let code = localStorage.getItem('delivery_saver_room_code');
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('delivery_saver_room_code', code);
    }
    this.roomCode = code;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public setRoomCode(newCode: string) {
    this.roomCode = newCode;
    localStorage.setItem('delivery_saver_room_code', newCode);
    this.reconnect();
  }

  public onStatusChange(callback: (status: boolean) => void) {
    this.onStatusChangeListeners.push(callback);
    callback(this.isConnected);
  }

  private notifyStatus(status: boolean) {
    this.isConnected = status;
    this.onStatusChangeListeners.forEach((cb) => cb(status));
  }

  public connect(customUrl?: string) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const envSyncUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SYNC_SERVER_URL;
    const serverUrl =
      customUrl ||
      localStorage.getItem('delivery_saver_relay_url') ||
      envSyncUrl ||
      'ws://localhost:3001';

    try {
      this.ws = new WebSocket(serverUrl);

      this.ws.onopen = () => {
        this.notifyStatus(true);
        // Join room
        this.ws?.send(
          JSON.stringify({
            type: 'join',
            room: this.roomCode
          })
        );
        // Push initial local sync
        this.pushLocalState();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sync' && data.payload) {
            await this.mergeInboundState(data.payload);
          }
        } catch (e) {
          console.error('Failed to parse inbound sync payload:', e);
        }
      };

      this.ws.onclose = () => {
        this.notifyStatus(false);
      };

      this.ws.onerror = () => {
        this.notifyStatus(false);
      };
    } catch {
      this.notifyStatus(false);
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }

  public reconnect() {
    this.disconnect();
    this.connect();
  }

  /**
   * Broadcast current database state to peers in room
   */
  public async pushLocalState() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const allMeals = await db.meals.toArray();
    const payload = JSON.stringify(allMeals);

    this.ws.send(
      JSON.stringify({
        type: 'sync',
        payload
      })
    );
  }

  /**
   * Merge incoming meals into Dexie IndexedDB
   */
  private async mergeInboundState(payloadStr: string) {
    try {
      const inboundMeals: MealRecord[] = JSON.parse(payloadStr);
      if (!Array.isArray(inboundMeals)) return;

      for (const meal of inboundMeals) {
        if (!meal.uuid) continue;
        const existing = await db.meals.where('uuid').equals(meal.uuid).first();
        if (!existing) {
          await db.meals.add({
            ...meal,
            id: undefined // Let local IndexedDB auto-increment primary key
          });
        } else if (meal.timestamp > existing.timestamp) {
          await db.meals.update(existing.id!, {
            ...meal,
            id: existing.id
          });
        }
      }
    } catch (err) {
      console.error('Error merging inbound sync state:', err);
    }
  }
}

export const syncClient = new SyncClient();
