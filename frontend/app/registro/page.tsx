'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { RUTA_POR_ROL, Rol, api, guardarSesion } from '../../lib/api';

export default function Registro() {
  const router = useRouter();
  const [tipo, setTipo] = useState<'estudiante' | 'empresa'>('estudiante');
  const [error, setError] = useState('');

  async function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (tipo === 'estudiante') body.semestreActual = Number(body.semestreActual) as never;
    try {
      const s = await api<{ accessToken: string; rol: Rol }>(`/auth/registro/${tipo}`, { body });
      guardarSesion(s);
      router.push(RUTA_POR_ROL[s.rol]);
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <main className="centrado">
      <div className="card">
        <h2>Crear cuenta</h2>
        <label>Tipo de cuenta
          <select value={tipo} onChange={(e) => setTipo(e.target.value as 'estudiante' | 'empresa')}>
            <option value="estudiante">Estudiante</option><option value="empresa">Empresa</option>
          </select>
        </label>
        <form key={tipo} onSubmit={registrar}>
          <label>Correo<input name="email" type="email" required /></label>
          <label>Contraseña (mín. 8)<input name="password" type="password" minLength={8} required /></label>
          {tipo === 'estudiante' ? (<>
            <label>Documento de identidad<input name="documentoIdentidad" required /></label>
            <label>Nombres<input name="nombres" required /></label>
            <label>Programa académico<input name="programaAcademico" required /></label>
            <label>Semestre actual<input name="semestreActual" type="number" min={1} max={12} required /></label>
          </>) : (<>
            <label>NIT<input name="nit" required /></label>
            <label>Razón social<input name="razonSocial" required /></label>
            <label>Sector<input name="sector" required /></label>
          </>)}
          <button>Registrarme</button>
          {error && <span className="error">{error}</span>}
        </form>
        <p><Link href="/">Volver al login</Link></p>
      </div>
    </main>
  );
}
