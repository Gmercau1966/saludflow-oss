import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/solicitud", label: "Crear solicitud" },
  { href: "/demo", label: "Demostración" },
  { href: "/architecture", label: "Arquitectura" },
];

export function MainNavigation() {
  return (
    <nav aria-label="Navegación principal">
      <ul className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="rounded-md px-3 py-2 transition hover:bg-teal-50 hover:text-accent focus-visible:bg-teal-50"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
