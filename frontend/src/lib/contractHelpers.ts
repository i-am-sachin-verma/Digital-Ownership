export interface DataItem {
  id: number;
  value: string;
  createdAt: number;
}

export class ContracthelpersService {
  private cache: Map<string, { data: DataItem; expiry: number }> = new Map();
  private readonly TTL = 60000; // 1 minute

  private save(key: string, item: DataItem): void {
    this.cache.set(key, { data: item, expiry: Date.now() + this.TTL });
  }

  private get(key: string): DataItem | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return cached.data;
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Backwards compatible API
  public createItem1(id: number, value: string): DataItem { return { id, value, createdAt: Date.now() }; }
  public saveItem1(key: string, item: DataItem): void { this.save(key, item); }
  public getItem1(key: string): DataItem | undefined { return this.get(key); }
}

export const contractHelpers = new ContracthelpersService();