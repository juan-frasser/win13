import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoVacante, Modalidad } from './vacante.entity';
import { VacantesService } from './vacantes.service';

describe('VacantesService', () => {
  const vacantes = { find: jest.fn(), findOne: jest.fn(), save: jest.fn((v) => Promise.resolve(v)) };
  const empresas = { findOne: jest.fn() };
  const service = new VacantesService(vacantes as any, empresas as any);

  beforeEach(() => jest.clearAllMocks());

  const dto = {
    titulo: 'Practicante Backend', descripcion: 'API REST', requisitos: 'NestJS',
    programa: 'Ingeniería Informática', modalidad: Modalidad.REMOTA, apoyoSostenimiento: 1500000,
  };

  it('CP-04: una vacante nueva queda PENDIENTE de auditoría (RF-02/RF-04)', async () => {
    empresas.findOne.mockResolvedValue({ id: 'e1' });
    const v = await service.crear('u1', dto);
    expect(v.estado).toBe(EstadoVacante.PENDIENTE);
    expect(v.empresa).toEqual({ id: 'e1' });
  });

  it('CP-05: la búsqueda del estudiante solo consulta vacantes APROBADAS', async () => {
    vacantes.find.mockResolvedValue([]);
    await service.buscar({ modalidad: Modalidad.REMOTA });
    expect(vacantes.find.mock.calls[0][0].where).toMatchObject({
      estado: EstadoVacante.APROBADA, modalidad: Modalidad.REMOTA,
    });
  });

  it('CP-06: solo se auditan vacantes pendientes y existentes', async () => {
    vacantes.findOne.mockResolvedValueOnce({ id: 'v1', estado: EstadoVacante.APROBADA });
    await expect(service.auditar('v1', { estado: EstadoVacante.RECHAZADA })).rejects.toThrow(BadRequestException);

    vacantes.findOne.mockResolvedValueOnce(null);
    await expect(service.auditar('x', { estado: EstadoVacante.APROBADA })).rejects.toThrow(NotFoundException);

    vacantes.findOne.mockResolvedValueOnce({ id: 'v2', estado: EstadoVacante.PENDIENTE });
    await expect(service.auditar('v2', { estado: EstadoVacante.APROBADA }))
      .resolves.toMatchObject({ estado: EstadoVacante.APROBADA });
  });
});
