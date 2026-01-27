import API from "@/api/axios";

// Interfaces
export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Normaliza id pra não dar ruim
const normalizeUser = (u: any): User => ({
  id: u.id ?? u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

const BASE = "/users";

type Listener = (users: User[]) => void;

class UserService {
  private cache: User[] | null = null;
  private listeners: Listener[] = [];
  private loading = false;

  //Notificação das telas
  private notify() {
    this.listeners.forEach((fn) => fn(this.cache || []));
  }

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    if (this.cache) fn(this.cache); // atualiza tela
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

//login
  async login(payload: LoginDTO) {
    const { data } = await API.post(`${BASE}/login`, payload);
    return data;
  }

  //listar + cache
  async getAll(force?: boolean): Promise<User[]> {
    if (this.cache && !force) return this.cache;
    if (this.loading) return this.cache!;

    this.loading = true;
    const { data } = await API.get(BASE);
    this.cache = data.map(normalizeUser);
    this.loading = false;

    this.notify();
    return this.cache;
  }

//pegar por id
  async getById(id: string): Promise<User> {
    const { data } = await API.get(`${BASE}/${id}`);
    return normalizeUser(data);
  }

 //criar + atualizar lista
  async create(payload: CreateUserDTO): Promise<User> {
    const { data } = await API.post(BASE, payload);
    const user = normalizeUser(data);

    this.cache = [...(this.cache || []), user];
    this.notify();

    return user;
  }
//atualizar + atualizar lista
  async update(id: string, payload: Partial<CreateUserDTO>): Promise<User> {
    const { data } = await API.put(`${BASE}/${id}`, payload);
    const updated = normalizeUser(data);

    this.cache = this.cache!.map((u) => (u.id === id ? updated : u));
    this.notify();

    return updated;
  }

//deletar
  async remove(id: string) {
    await API.delete(`${BASE}/${id}`);
    this.cache = this.cache!.filter((u) => u.id !== id);
    this.notify();
  }
}

export const UserServiceInstance = new UserService();
