export interface Telefono {
  numero: string;
}

export interface Contact {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefonos: Telefono[];
}
