import { Link } from 'react-router-dom';
import FooterComp from '../body/FooterComp';

export default function PageShell({ title, eyebrow = 'YOUR GAMEHOUSE', description, children, action, backTo = '/home', backLabel = 'Home', showHeading = true }) {
  return <div className="gh-storefront gh-app"><div className="gh-container gh-page">
    <nav className="gh-breadcrumb" aria-label="Breadcrumb"><Link to={backTo}>{backLabel}</Link><span>/</span><span>{title}</span></nav>
    {showHeading && <header className="gh-page-heading"><div><p className="gh-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>}
    {children}
  </div><FooterComp /></div>;
}
