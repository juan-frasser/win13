import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Rol } from '../auth/rol.enum';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const auth = { crearEstudiante: jest.fn(), crearEmpresa: jest.fn() };
  const usuarios = { findOne: jest.fn(), update: jest.fn() };
  const estudiantes = { findOne: jest.fn(), findOneOrFail: jest.fn(), update: jest.fn(), find: jest.fn() };
  const empresas = { findOne: jest.fn(), findOneOrFail: jest.fn(), update: jest.fn(), find: jest.fn() };
  const service = new AdminService(auth as any, usuarios as any, estudiantes as any, empresas as any);

  beforeEach(() => jest.clearAllMocks());

  it('CP-10: crear estudiante reutiliza el registro y devuelve la entidad sin hash', async () => {
    auth.crearEstudiante.mockResolvedValue({ id: 'e1', usuario: { password: 'hash' } });
    estudiantes.findOneOrFail.mockResolvedValue({ id: 'e1', usuario: { email: 'a@ucn.edu.co' } });
    const res = await service.crearEstudiante({} as any);
    expect(estudiantes.findOneOrFail).toHaveBeenCalledWith({ where: { id: 'e1' } });
    expect(res.usuario).not.toHaveProperty('password');
  });

  it('CP-11: actualizar rechaza perfil inexistente y NIT ya usado por otra empresa', async () => {
    empresas.findOne.mockResolvedValueOnce(null);
    await expect(service.actualizarEmpresa('x', { sector: 'Salud' })).rejects.toThrow(NotFoundException);

    empresas.findOne.mockResolvedValueOnce({ id: 'e1', nit: '1' }).mockResolvedValueOnce({ id: 'e2', nit: '2' });
    await expect(service.actualizarEmpresa('e1', { nit: '2' })).rejects.toThrow(ConflictException);
    expect(empresas.update).not.toHaveBeenCalled();
  });

  it('CP-12: desactivar cuentas funciona para estudiantes/empresas pero no para administradores', async () => {
    usuarios.findOne.mockResolvedValueOnce({ id: 'a1', rol: Rol.ADMIN });
    await expect(service.cambiarActivo('a1', false)).rejects.toThrow(BadRequestException);

    usuarios.findOne.mockResolvedValueOnce({ id: 'u1', rol: Rol.ESTUDIANTE });
    await expect(service.cambiarActivo('u1', false)).resolves.toEqual({ id: 'u1', activo: false });
    expect(usuarios.update).toHaveBeenCalledWith('u1', { activo: false });
  });
});
