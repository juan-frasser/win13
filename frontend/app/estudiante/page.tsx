'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useSesion } from '../../lib/useSesion';
import { Encabezado } from '../Encabezado';

interface Vacante { id: string; titulo: string; descripcion: string; requisitos: string; programa: string; modalidad: string; apoyoSostenimiento: number; empresa: { razonSocial: string } }
interface Postulacion { id: string; estado: string; vacante: Vacante }

export default function PanelEstudiante() {
  const { listo, salir } = useSesion('ESTUDIANTE');
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [mias, setMias] = useState<Postulacion[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const buscar = useCallback(async (params = '') => setVacantes(await api<Vacante[]>('/vacantes' + params)), []);
  const cargarMias = useCallback(async () => setMias(await api<Postulacion[]>('/postulaciones/mias')), []);
  useEffect(() => { if (listo) { buscar(); cargarMias(); } }, [listo, buscar, cargarMias]);

  function filtrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p = new URLSearchParams();
    for (const k of ['q', 'programa', 'modalidad']) if (f.get(k)) p.set(k, String(f.get(k)));
    buscar(p.size ? `?${p}` : '');
  }

  async function postular(vacanteId: string) {
    try {
      await api('/postulaciones', { body: { vacanteId } });
      setMsg({ ok: true, texto: 'Postulación enviada' });
      cargarMias();
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); }
  }

  if (!listo) return null;
  return (<>
    <Encabezado titulo="Estudiante" salir={salir} />
    <main>
      <div className="card">
        <h3>Buscar vacantes</h3>
        <form className="fila" onSubmit={filtrar}>
          <label>Palabra clave<input name="q" /></label>
          <label>Programa<input name="programa" /></label>
          <label>Modalidad
            <select name="modalidad"><option value="">Todas</option><option>PRESENCIAL</option><option>REMOTA</option><option>HIBRIDA</option></select>
          </label>
          <button>Filtrar</button>
        </form>
        {msg && <p className={msg.ok ? 'exito' : 'error'}>{msg.texto}</p>}
      </div>
      <div className="grid">
        {vacantes.map((v) => (
          <div className="card" key={v.id}>
            <h4>{v.titulo}</h4>
            <p>{v.empresa.razonSocial}</p>
            <p>{v.descripcion}</p>
            <p><span className="badge">{v.modalidad}</span> <span className="badge">{v.programa}</span></p>
            <p>Apoyo de sostenimiento: ${v.apoyoSostenimiento.toLocaleString('es-CO')}</p>
            <button onClick={() => postular(v.id)}>Postularme</button>
          </div>
        ))}
        {!vacantes.length && <p>No hay vacantes disponibles con esos filtros.</p>}
      </div>
      <h3>Mis postulaciones</h3>
      <table>
        <thead><tr><th>Vacante</th><th>Empresa</th><th>Estado</th></tr></thead>
        <tbody>{mias.map((p) => (
          <tr key={p.id}><td>{p.vacante.titulo}</td><td>{p.vacante.empresa.razonSocial}</td><td><span className="badge">{p.estado}</span></td></tr>
        ))}</tbody>
      </table>
    </main>
  </>);
}
