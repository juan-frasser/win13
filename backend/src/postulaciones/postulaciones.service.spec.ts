import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EstadoVacante } from '../vacantes/vacante.entity';
import { EstadoPostulacion } from './postulacion.entity';
import { PostulacionesService } from './postulaciones.service';

describe('PostulacionesService', () => {
  const postulaciones = { findOne: jest.fn(), find: jest.fn(), save: jest.fn((p) => Promise.resolve(p)) };
  const vacantes = { findOne: jest.fn() };
  const estudiantes = { findOne: jest.fn() };
  const service = new PostulacionesService(postulaciones as any, vacantes as any, estudiantes as any);

  beforeEach(() => {
    jest.clearAllMocks();
    estudiantes.findOne.mockResolvedValue({ id: 'est1' });
  });

  it('CP-07: no permite postularse a una vacante no aprobada (RF-03/RF-04)', async () => {
    vacantes.findOne.mockResolvedValue({ id: 'v1', estado: EstadoVacante.PENDIENTE });
    await expect(service.postular('u1', 'v1')).rejects.toThrow(BadRequestException);
    expect(postulaciones.save).not.toHaveBeenCalled();
  });

  it('CP-08: no permite postularse dos veces a la misma vacante', async () => {
    vacantes.findOne.mockResolvedValue({ id: 'v1', estado: EstadoVacante.APROBADA, activa: true });
    postulaciones.findOne.mockResolvedValue({ id: 'p1' });
    await expect(service.postular('u1', 'v1')).rejects.toThrow(ConflictException);
  });

  it('CP-09: solo la empresa dueña de la vacante cambia el estado del candidato (RF-05)', async () => {
    postulaciones.findOne.mockResolvedValue({
      id: 'p1', estado: EstadoPostulacion.POSTULADO, vacante: { empresa: { usuario: { id: 'dueña' } } },
    });
    await expect(service.cambiarEstado('otra', 'p1', { estado: EstadoPostulacion.SELECCIONADO }))
      .rejects.toThrow(ForbiddenException);
    await expect(service.cambiarEstado('dueña', 'p1', { estado: EstadoPostulacion.SELECCIONADO }))
      .resolves.toMatchObject({ estado: EstadoPostulacion.SELECCIONADO });
  });

  it('CP-15: no admite postulaciones nuevas a una vacante desactivada por la empresa', async () => {
    vacantes.findOne.mockResolvedValue({ id: 'v1', estado: EstadoVacante.APROBADA, activa: false });
    await expect(service.postular('u1', 'v1')).rejects.toThrow(BadRequestException);
    expect(postulaciones.save).not.toHaveBeenCalled();
  });
});
