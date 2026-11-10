'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export interface Campo { name: string; label: string; type?: 'text' | 'number' }
export interface Config { ruta: 'estudiantes' | 'empresas'; singular: string; campos: Campo[] }
type Perfil = { id: string; usuario: { id: string; email: string; activo: boolean } } & Record<string, string | number | object>;

export const ESTUDIANTES: Config = {
  ruta: 'estudiantes', singular: 'estudiante',
  campos: [
    { name: 'nombres', label: 'Nombres' }, { name: 'documentoIdentidad', label: 'Documento' },
    { name: 'programaAcademico', label: 'Programa' }, { name: 'semestreActual', label: 'Semestre', type: 'number' },
  ],
};
export const EMPRESAS: Config = {
  ruta: 'empresas', singular: 'empresa',
  campos: [{ name: 'razonSocial', label: 'Razón social' }, { name: 'nit', label: 'NIT' }, { name: 'sector', label: 'Sector' }],
};

/** Listado, alta, edición y activación/desactivación de perfiles (UC1: registrar estudiantes y empresas). */
export function Gestion({ config }: { config: Config }) {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [editando, setEditando] = useState<Perfil | null>(null);
  const [creando, setCreando] = useState(false);
  const [reseteando, setReseteando] = useState<Perfil | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => setPerfiles(await api<Perfil[]>(`/admin/${config.ruta}`)), [config.ruta]);
  useEffect(() => { cargar(); }, [cargar]);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body: Record<string, FormDataEntryValue | number> = Object.fromEntries(new FormData(e.currentTarget));
    for (const c of config.campos) if (c.type === 'number') body[c.name] = Number(body[c.name]);
    try {
      if (editando) await api(`/admin/${config.ruta}/${editando.id}`, { method: 'PATCH', body });
      else await api(`/admin/${config.ruta}`, { body });
      setMsg({ ok: true, texto: editando ? 'Perfil actualizado' : `Cuenta de ${config.singular} creada` });
      setEditando(null); setCreando(false); cargar();
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); }
  }

  async function alternarActivo(p: Perfil) {
    await api(`/admin/usuarios/${p.usuario.id}/activo`, { method: 'PATCH', body: { activo: !p.usuario.activo } });
    cargar();
  }

  async function restablecer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { password } = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`/admin/usuarios/${reseteando!.usuario.id}/password`, { method: 'PATCH', body: { password } });
      setMsg({ ok: true, texto: `Clave restablecida para ${reseteando!.usuario.email}. Entrégasela al usuario por un canal seguro.` });
      setReseteando(null);
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); }
  }

  const formAbierto = creando || editando;
  return (<>
    <div className="fila" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ margin: 0 }}>Registrados: {perfiles.length}</h3>
      {!formAbierto && <button onClick={() => { setCreando(true); setReseteando(null); setMsg(null); }}>Crear {config.singular}</button>}
    </div>
    {msg && <p className={msg.ok ? 'exito' : 'error'}>{msg.texto}</p>}
    {formAbierto && (
      <div className="card">
        <h4>{editando ? `Editar ${config.singular}` : `Nueva cuenta de ${config.singular}`}</h4>
        <form key={editando?.id ?? 'nuevo'} onSubmit={guardar}>
          {!editando && <>
            <label>Correo<input name="email" type="email" required /></label>
            <label>Contraseña inicial (mín. 8)<input name="password" type="password" minLength={8} required /></label>
          </>}
          {config.campos.map((c) => (
            <label key={c.name}>{c.label}
              <input name={c.name} type={c.type ?? 'text'} defaultValue={editando ? String(editando[c.name]) : ''} required />
            </label>
          ))}
          <div className="fila">
            <button>{editando ? 'Guardar cambios' : 'Crear cuenta'}</button>
            <button type="button" className="sec" onClick={() => { setCreando(false); setEditando(null); }}>Cancelar</button>
          </div>
        </form>
      </div>
    )}
    {reseteando && (
      <div className="card">
        <h4>Restablecer clave de {reseteando.usuario.email}</h4>
        <form key={reseteando.id} onSubmit={restablecer} className="fila">
          <label>Nueva clave (mín. 8)<input name="password" type="password" minLength={8} required autoFocus /></label>
          <button>Restablecer</button>
          <button type="button" className="sec" onClick={() => setReseteando(null)}>Cancelar</button>
        </form>
      </div>
    )}
    {!perfiles.length ? <div className="card"><p>Aún no hay {config.ruta}. Usa “Crear {config.singular}” o espera a que se registren.</p></div> : (
      <table>
        <thead><tr>{config.campos.map((c) => <th key={c.name}>{c.label}</th>)}<th>Correo</th><th>Estado</th><th></th></tr></thead>
        <tbody>{perfiles.map((p) => (
          <tr key={p.id}>
            {config.campos.map((c) => <td key={c.name}>{String(p[c.name])}</td>)}
            <td>{p.usuario.email}</td>
            <td><span className="badge">{p.usuario.activo ? 'ACTIVA' : 'DESACTIVADA'}</span></td>
            <td className="fila">
              <button className="sec" onClick={() => { setEditando(p); setCreando(false); setReseteando(null); setMsg(null); }}>Editar</button>
              <button className="sec" onClick={() => { setReseteando(p); setEditando(null); setCreando(false); setMsg(null); }}>Restablecer clave</button>
              <button className={p.usuario.activo ? 'mal' : 'ok'} onClick={() => alternarActivo(p)}>
                {p.usuario.activo ? 'Desactivar' : 'Activar'}
              </button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    )}
  </>);
}
