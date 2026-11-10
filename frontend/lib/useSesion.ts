'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Rol, cerrarSesion, leerSesion } from './api';

/** Redirige al login si no hay sesión o el rol no corresponde a la pantalla. */
export function useSesion(rol: Rol) {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (leerSesion()?.rol !== rol) router.replace('/');
    else setListo(true);
  }, [rol, router]);
  return { listo, salir: () => { cerrarSesion(); router.replace('/'); } };
}
