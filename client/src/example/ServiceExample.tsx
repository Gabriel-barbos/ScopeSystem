import API from "@/api/axios";

// ============================================
// TIPOS E INTERFACES
// ============================================

export type CreateClientDTO = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  cpf?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  cpf?: string;
  createdAt?: string;
};

// ============================================
// NORMALIZAÇÃO
// ============================================

const normalizeClient = (c: any): Client => ({
  id: c.id ?? c._id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  address: c.address,
  cpf: c.cpf,
  createdAt: c.createdAt,
});

// ============================================
// SERVICE CLASS
// ============================================

const BASE = "/clients";

type Listener = (clients: Client[]) => void;

class ClientService {
  private cache: Client[] | null = null;
  private listeners: Listener[] = [];
  private loading = false;

  // Notifica todas as telas inscritas
  private notify() {
    this.listeners.forEach((fn) => fn(this.cache || []));
  }

  // Sistema de inscrição (Observer Pattern)
  subscribe(fn: Listener) {
    this.listeners.push(fn);
    if (this.cache) fn(this.cache);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  // LISTAR com cache
  async getAll(force?: boolean): Promise<Client[]> {
    if (this.cache && !force) return this.cache;
    if (this.loading) return this.cache!;

    this.loading = true;
    const { data } = await API.get(BASE);
    this.cache = data.map(normalizeClient);
    this.loading = false;

    this.notify();
    return this.cache;
  }

  // BUSCAR POR ID
  async getById(id: string): Promise<Client> {
    const { data } = await API.get(`${BASE}/${id}`);
    return normalizeClient(data);
  }

  // CRIAR
  async create(payload: CreateClientDTO): Promise<Client> {
    const { data } = await API.post(BASE, payload);
    const client = normalizeClient(data);

    this.cache = [...(this.cache || []), client];
    this.notify();

    return client;
  }

  // ATUALIZAR
  async update(id: string, payload: Partial<CreateClientDTO>): Promise<Client> {
    const { data } = await API.put(`${BASE}/${id}`, payload);
    const updated = normalizeClient(data);

    this.cache = this.cache!.map((c) => (c.id === id ? updated : c));
    this.notify();

    return updated;
  }

  // DELETAR
  async remove(id: string) {
    await API.delete(`${BASE}/${id}`);
    this.cache = this.cache!.filter((c) => c.id !== id);
    this.notify();
  }
}

export const ClientServiceInstance = new ClientService();