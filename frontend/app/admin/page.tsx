'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useSesion } from '../../lib/useSesion';
import { Encabezado } from '../Encabezado';

interface Vacante { id: string; titulo: string; descripcion: string; programa: string; modalidad: string; apoyoSostenimiento: number; empresa: { razonSocial: string } }

export default function PanelAdmin() {
  const { listo, salir } = useSesion('ADMIN');
  const [pendientes, setPendientes] = useState<Vacante[]>([]);

  const cargar = useCallback(async () => setPendientes(await api<Vacante[]>('/vacantes/pendientes')), []);
  useEffect(() => { if (listo) cargar(); }, [listo, cargar]);

  async function auditar(id: string, estado: 'APROBADA' | 'RECHAZADA') {
    await api(`/vacantes/${id}/estado`, { method: 'PATCH', body: { estado } });
    cargar();
  }

  if (!listo) return null;
  return (<>
    <Encabezado titulo="Coordinación" salir={salir} />
    <main>
      <div className="card"><h3>Vacantes pendientes de auditoría: {pendientes.length}</h3></div>
      {!pendientes.length && (
        <div className="card">
          <p>No hay vacantes por auditar. Las empresas envían aquí sus vacantes para que las apruebes o rechaces antes de que los estudiantes puedan verlas.</p>
          <p>Para probar: cierra sesión, crea una cuenta de <b>Empresa</b> en “Regístrate” y publica una vacante.</p>
        </div>
      )}
      {pendientes.length > 0 && <table>
        <thead><tr><th>Vacante</th><th>Empresa</th><th>Programa · Modalidad</th><th>Apoyo</th><th></th></tr></thead>
        <tbody>{pendientes.map((v) => (
          <tr key={v.id}>
            <td><b>{v.titulo}</b><br /><small>{v.descripcion}</small></td>
            <td>{v.empresa.razonSocial}</td>
            <td>{v.programa} · {v.modalidad}</td>
            <td>${v.apoyoSostenimiento.toLocaleString('es-CO')}</td>
            <td className="fila">
              <button className="ok" onClick={() => auditar(v.id, 'APROBADA')}>Aprobar</button>
              <button className="mal" onClick={() => auditar(v.id, 'RECHAZADA')}>Rechazar</button>
            </td>
          </tr>
        ))}</tbody>
      </table>}
    </main>
  </>);
}
