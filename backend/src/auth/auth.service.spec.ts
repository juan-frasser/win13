import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Rol } from './rol.enum';

const repo = () => ({ findOne: jest.fn(), save: jest.fn((e) => Promise.resolve(e)) });

describe('AuthService', () => {
  let usuarios: ReturnType<typeof repo>, estudiantes: ReturnType<typeof repo>, empresas: ReturnType<typeof repo>;
  let service: AuthService;

  beforeEach(() => {
    usuarios = repo(); estudiantes = repo(); empresas = repo();
    service = new AuthService(usuarios as any, estudiantes as any, empresas as any,
      { sign: jest.fn().mockReturnValue('jwt-falso') } as unknown as JwtService);
  });

  const estudiante = {
    email: 'ana@ucn.edu.co', password: 'Clave12345', documentoIdentidad: '100', nombres: 'Ana',
    programaAcademico: 'Ingeniería Informática', semestreActual: 8,
  };

  it('CP-01: registra un estudiante con la contraseña hasheada y rol ESTUDIANTE (RNF-01)', async () => {
    usuarios.findOne.mockResolvedValue(null);
    const res = await service.registrarEstudiante(estudiante);

    const guardado = estudiantes.save.mock.calls[0][0];
    expect(guardado.usuario.rol).toBe(Rol.ESTUDIANTE);
    expect(guardado.usuario.password).not.toBe(estudiante.password);
    expect(await bcrypt.compare(estudiante.password, guardado.usuario.password)).toBe(true);
    expect(res.accessToken).toBe('jwt-falso');
  });

  it('CP-02: rechaza el registro si el correo ya existe', async () => {
    usuarios.findOne.mockResolvedValue({ id: 'u1' });
    await expect(service.registrarEstudiante(estudiante)).rejects.toThrow(ConflictException);
    expect(estudiantes.save).not.toHaveBeenCalled();
  });

  it('CP-03: el login falla con contraseña incorrecta y funciona con la correcta', async () => {
    const password = await bcrypt.hash('Clave12345', 4);
    usuarios.findOne.mockResolvedValue({ id: 'u1', rol: Rol.EMPRESA, password });

    await expect(service.login({ email: 'e@x.co', password: 'mala' })).rejects.toThrow(UnauthorizedException);
    await expect(service.login({ email: 'e@x.co', password: 'Clave12345' }))
      .resolves.toEqual({ accessToken: 'jwt-falso', rol: Rol.EMPRESA });
  });
});
