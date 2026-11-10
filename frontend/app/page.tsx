'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { RUTA_POR_ROL, Rol, api, guardarSesion } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const s = await api<{ accessToken: string; rol: Rol }>('/auth/login', {
        body: { email: f.get('email'), password: f.get('password') },
      });
      guardarSesion(s);
      router.push(RUTA_POR_ROL[s.rol]);
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <main className="centrado">
      <div className="card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={entrar}>
          <label>Correo institucional<input name="email" type="email" required /></label>
          <label>Contraseña<input name="password" type="password" required /></label>
          <button>Ingresar</button>
          {error && <span className="error">{error}</span>}
        </form>
        <p>¿Sin cuenta? <Link href="/registro">Regístrate</Link></p>
      </div>
    </main>
  );
}
