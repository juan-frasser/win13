'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useSesion } from '../../lib/useSesion';
import { Encabezado } from '../Encabezado';

interface Vacante { id: string; titulo: string; modalidad: string; estado: string; activa: boolean }
interface Candidato { id: string; estado: string; vacante: Vacante; estudiante: { nombres: string; programaAcademico: string; semestreActual: number; usuario: { email: string } } }
const ESTADOS = ['POSTULADO', 'EN_ENTREVISTA', 'SELECCIONADO', 'RECHAZADO'];

export default function PanelEmpresa() {
  const { listo, salir } = useSesion('EMPRESA');
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    setVacantes(await api<Vacante[]>('/vacantes/mias'));
    setCandidatos(await api<Candidato[]>('/postulaciones/candidatos'));
  }, []);
  useEffect(() => { if (listo) cargar(); }, [listo, cargar]);

  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.apoyoSostenimiento = Number(body.apoyoSostenimiento) as never;
    try {
      await api('/vacantes', { body });
      form.reset();
      setMsg({ ok: true, texto: 'Vacante enviada a auditoría de la coordinación' });
      cargar();
    } catch (err) { setMsg({ ok: false, texto: (err as Error).message }); }
  }

  async function cambiarEstado(id: string, estado: string) {
    await api(`/postulaciones/${id}/estado`, { method: 'PATCH', body: { estado } });
    cargar();
  }

  async function alternarActiva(v: Vacante) {
    await api(`/vacantes/${v.id}/activa`, { method: 'PATCH', body: { activa: !v.activa } });
    cargar();
  }

  if (!listo) return null;
  return (<>
    <Encabezado titulo="Empresa" salir={salir} />
    <main>
      <div className="card">
        <h3>Publicar vacante</h3>
        <form onSubmit={crear}>
          <label>Título<input name="titulo" required /></label>
          <label>Descripción<textarea name="descripcion" required /></label>
          <label>Requisitos<textarea name="requisitos" required /></label>
          <div className="fila">
            <label>Programa<input name="programa" required /></label>
            <label>Modalidad<select name="modalidad"><option>PRESENCIAL</option><option>REMOTA</option><option>HIBRIDA</option></select></label>
            <label>Apoyo de sostenimiento (COP)<input name="apoyoSostenimiento" type="number" min={0} defaultValue={0} required /></label>
          </div>
          <button>Enviar a auditoría</button>
          {msg && <span className={msg.ok ? 'exito' : 'error'}>{msg.texto}</span>}
        </form>
      </div>
      <h3>Mis vacantes</h3>
      <table>
        <thead><tr><th>Título</th><th>Modalidad</th><th>Auditoría</th><th>Recibe postulaciones</th><th></th></tr></thead>
        <tbody>{vacantes.map((v) => (
          <tr key={v.id}>
            <td>{v.titulo}</td><td>{v.modalidad}</td>
            <td><span className="badge">{v.estado}</span></td>
            <td><span className="badge">{v.activa ? 'SÍ' : 'CERRADA'}</span></td>
            <td><button className={v.activa ? 'mal' : 'ok'} onClick={() => alternarActiva(v)}>{v.activa ? 'Desactivar' : 'Reactivar'}</button></td>
          </tr>
        ))}</tbody>
      </table>
      <h3>Candidatos</h3>
      <table>
        <thead><tr><th>Estudiante</th><th>Programa</th><th>Vacante</th><th>Estado</th></tr></thead>
        <tbody>{candidatos.map((c) => (
          <tr key={c.id}>
            <td>{c.estudiante.nombres}<br /><small>{c.estudiante.usuario.email}</small></td>
            <td>{c.estudiante.programaAcademico} · sem. {c.estudiante.semestreActual}</td>
            <td>{c.vacante.titulo}</td>
            <td><select value={c.estado} onChange={(e) => cambiarEstado(c.id, e.target.value)}>{ESTADOS.map((s) => <option key={s}>{s}</option>)}</select></td>
          </tr>
        ))}</tbody>
      </table>
    </main>
  </>);
}
