export function Encabezado({ titulo, salir }: { titulo: string; salir: () => void }) {
  return (
    <header>
      <h1>Prácticas Profesionales UCN · {titulo}</h1>
      <button className="sec" onClick={salir}>Cerrar sesión</button>
    </header>
  );
}
