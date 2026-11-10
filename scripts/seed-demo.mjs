// Carga datos de demostración vía API. Es idempotente: si la cuenta ya existe, inicia sesión.
const API = process.env.API_URL ?? 'http://localhost:3001';

async function llamar(ruta, { metodo = 'POST', cuerpo, token } = {}) {
  const res = await fetch(API + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: cuerpo && JSON.stringify(cuerpo),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function sesion(rutaRegistro, perfil) {
  let r = await llamar(rutaRegistro, { cuerpo: perfil });
  if (r.status === 409) r = await llamar('/auth/login', { cuerpo: { email: perfil.email, password: perfil.password } });
  if (!r.data.accessToken) throw new Error(`No se pudo iniciar sesión como ${perfil.email}: ${JSON.stringify(r.data)}`);
  return r.data.accessToken;
}

for (let i = 0; i < 30; i++) {            // espera a que la API responda
  if (await fetch(API).then(() => true, () => false)) break;
  await new Promise((r) => setTimeout(r, 1000));
}

const admin = (await llamar('/auth/login', { cuerpo: { email: 'admin@ucn.edu.co', password: 'Admin12345' } })).data.accessToken;
const empresa = await sesion('/auth/registro/empresa', {
  email: 'rrhh@acme.co', password: 'Clave12345', nit: '900123456', razonSocial: 'ACME Tecnología SAS', sector: 'Tecnología',
});
const estudiante = await sesion('/auth/registro/estudiante', {
  email: 'ana.perez@ucn.edu.co', password: 'Clave12345', documentoIdentidad: '1001234567',
  nombres: 'Ana Pérez', programaAcademico: 'Ingeniería Informática', semestreActual: 8,
});

const existentes = (await llamar('/vacantes/mias', { metodo: 'GET', token: empresa })).data;
if (existentes.length === 0) {
  const base = { programa: 'Ingeniería Informática', requisitos: 'Ver descripción' };
  const nuevas = [
    { titulo: 'Practicante de Desarrollo Backend', descripcion: 'Apoyo en APIs REST con NestJS y PostgreSQL.', modalidad: 'REMOTA', apoyoSostenimiento: 1500000 },
    { titulo: 'Practicante de Analítica de Datos', descripcion: 'Tableros y limpieza de datos.', modalidad: 'HIBRIDA', apoyoSostenimiento: 1300000 },
    { titulo: 'Practicante de Soporte TI', descripcion: 'Atención de incidentes de usuarios.', modalidad: 'PRESENCIAL', apoyoSostenimiento: 1200000 },
  ];
  const ids = [];
  for (const v of nuevas) ids.push((await llamar('/vacantes', { cuerpo: { ...base, ...v }, token: empresa })).data.id);
  // Aprueba dos; la tercera queda pendiente para que el administrador pruebe la auditoría.
  for (const id of ids.slice(0, 2)) await llamar(`/vacantes/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado: 'APROBADA' }, token: admin });
  const p = await llamar('/postulaciones', { cuerpo: { vacanteId: ids[0] }, token: estudiante });
  await llamar(`/postulaciones/${p.data.id}/estado`, { metodo: 'PATCH', cuerpo: { estado: 'EN_ENTREVISTA' }, token: empresa });
}

console.log(`
Datos de demostración listos. Cuentas:
  Administrador  admin@ucn.edu.co        / Admin12345
  Empresa        rrhh@acme.co            / Clave12345
  Estudiante     ana.perez@ucn.edu.co    / Clave12345`);
