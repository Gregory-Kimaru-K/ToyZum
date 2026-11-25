import { Link } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Icon from '../storefront/Icon';

export default function FooterComp() {
  return <footer className="gh-footer"><div className="gh-container">
    <div className="gh-footer-main"><div><Link to="/home"><BrandLogo alt="Gamehouse Kenya home" /></Link><p>A little fun for everyone.<br />A lot of good times together.</p></div><nav aria-label="Footer shop links"><h2>Find your fun</h2><Link to="/home/products">All games & toys</Link><Link to="/home/products?q=board">Board games</Link><Link to="/home/products?q=puzzle">Puzzles</Link><Link to="/home#find-your-play">Shopping inspiration</Link></nav><nav aria-label="Footer account links"><h2>Your Gamehouse</h2><Link to="/profile">My account</Link><Link to="/myorders">My orders</Link><Link to="/cart">Shopping bag</Link></nav><div className="gh-footer-signoff"><Icon name="dice" size={32} /><p>Never too young.<br /><strong>Never too grown-up.</strong></p></div></div>
    <div className="gh-footer-bottom"><span>© {new Date().getFullYear()} Gamehouse Kenya</span><span>Let the good times play.</span></div>
  </div></footer>;
}
