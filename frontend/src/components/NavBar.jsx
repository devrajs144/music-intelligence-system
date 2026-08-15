import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  const links = [
    { path: "/dashboard", label: "Music DNA" },
    { path: "/memory", label: "Memory" },
    { path: "/bubble", label: "Bubble" },
  ];

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 px-8 py-4">
      <div className="max-w-4xl mx-auto flex gap-6">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium ${location.pathname === link.path ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
