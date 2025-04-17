
import { Link } from "react-router-dom";

interface NavLink {
  title: string;
  href: string;
  authRequired?: boolean;
  guestOnly?: boolean;
}

interface NavLinksProps {
  links: NavLink[];
  user: any;
  mobile?: boolean;
  onClick?: () => void;
}

const NavLinks = ({ links, user, mobile, onClick }: NavLinksProps) => {
  const filteredLinks = links.filter(link => {
    if (link.authRequired && !user) return false;
    if (link.guestOnly && user) return false;
    return true;
  });

  if (mobile) {
    return (
      <>
        {filteredLinks.map(link => (
          <Link
            key={link.title}
            to={link.href}
            className="block px-3 py-2 rounded-clay text-indigo-600 hover:bg-clay-lavender/50"
            onClick={onClick}
          >
            {link.title}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {filteredLinks.map(link => (
        <Link key={link.title} to={link.href} className="clay-nav-item">
          {link.title}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
