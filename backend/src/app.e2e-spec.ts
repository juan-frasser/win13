import './e2e-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module';

// Integración: API real + TypeORM sobre sql.js en memoria (mismo esquema que PostgreSQL).
describe('Flujo de prácticas (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const tokens: Record<string, string> = {};
  let vacanteId: string;
  let postulacionId: string;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    http = request(app.getHttpServer());
  });
  afterAll(() => app.close());

  it('IT-01: registro de empresa y estudiante, y login del administrador sembrado', async () => {
    const emp = await http.post('/auth/registro/empresa')
      .send({ email: 'rrhh@acme.co', password: 'Clave12345', nit: '900123', razonSocial: 'ACME SAS', sector: 'Tecnología' })
      .expect(201);
    const est = await http.post('/auth/registro/estudiante')
      .send({ email: 'ana@ucn.edu.co', password: 'Clave12345', documentoIdentidad: '100', nombres: 'Ana',
        programaAcademico: 'Ingeniería Informática', semestreActual: 8 })
      .expect(201);
    const adm = await http.post('/auth/login').send({ email: 'admin@ucn.edu.co', password: 'Admin12345' }).expect(201);
    Object.assign(tokens, { empresa: emp.body.accessToken, estudiante: est.body.accessToken, admin: adm.body.accessToken });
    expect(adm.body.rol).toBe('ADMIN');
  });

  it('IT-02: validación de entrada y control de acceso por rol', async () => {
    await http.post('/auth/registro/estudiante').send({ email: 'malo', password: '1' }).expect(400);
    await http.post('/auth/login').send({ email: 'ana@ucn.edu.co', password: 'incorrecta' }).expect(401);
    await http.get('/vacantes').expect(401);
    await http.get('/vacantes').set(auth(tokens.empresa)).expect(403);
    await http.get('/vacantes/pendientes').set(auth(tokens.estudiante)).expect(403);
  });

  it('IT-03: la vacante creada no es visible hasta que el administrador la aprueba', async () => {
    const creada = await http.post('/vacantes').set(auth(tokens.empresa))
      .send({ titulo: 'Practicante Backend', descripcion: 'API REST con NestJS', requisitos: 'TypeScript',
        programa: 'Ingeniería Informática', modalidad: 'REMOTA', apoyoSostenimiento: 1500000 })
      .expect(201);
    vacanteId = creada.body.id;
    expect(creada.body.estado).toBe('PENDIENTE');

    expect((await http.get('/vacantes').set(auth(tokens.estudiante)).expect(200)).body).toHaveLength(0);
    await http.post('/postulaciones').set(auth(tokens.estudiante)).send({ vacanteId }).expect(400);

    const pendientes = await http.get('/vacantes/pendientes').set(auth(tokens.admin)).expect(200);
    expect(pendientes.body.map((v: { id: string }) => v.id)).toContain(vacanteId);
    await http.patch(`/vacantes/${vacanteId}/estado`).set(auth(tokens.admin)).send({ estado: 'APROBADA' }).expect(200);

    const visibles = await http.get('/vacantes?q=Backend&modalidad=REMOTA').set(auth(tokens.estudiante)).expect(200);
    expect(visibles.body).toHaveLength(1);
  });

  it('IT-04: postulación, duplicado bloqueado y cambio de estado por la empresa', async () => {
    const p = await http.post('/postulaciones').set(auth(tokens.estudiante)).send({ vacanteId }).expect(201);
    postulacionId = p.body.id;
    await http.post('/postulaciones').set(auth(tokens.estudiante)).send({ vacanteId }).expect(409);

    const candidatos = await http.get('/postulaciones/candidatos').set(auth(tokens.empresa)).expect(200);
    expect(candidatos.body[0].estudiante.nombres).toBe('Ana');
    expect(candidatos.body[0].estudiante.usuario.password).toBeUndefined();

    await http.patch(`/postulaciones/${postulacionId}/estado`).set(auth(tokens.empresa))
      .send({ estado: 'SELECCIONADO' }).expect(200);
    const mias = await http.get('/postulaciones/mias').set(auth(tokens.estudiante)).expect(200);
    expect(mias.body[0].estado).toBe('SELECCIONADO');
  });
});
