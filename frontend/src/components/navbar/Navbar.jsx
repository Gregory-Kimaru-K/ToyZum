import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import AuthContext from '../../Context/AuthContext';
import Icon from '../storefront/Icon';
import '../../styles/navbar.css';

export default function Navbar({ dropdown, setDropdown }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const accountRef = useRef(null);
  const isSeller = user && ['SELLER', 'SUPERUSER'].includes(user.role);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') || '');
    setDropdown(false);
  }, [location.pathname, location.search, setDropdown]);

  useEffect(() => {
    if (!dropdown) return;
    const close = event => { if (!accountRef.current?.contains(event.target)) setDropdown(false); };
    const escape = event => { if (event.key === 'Escape') setDropdown(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [dropdown, setDropdown]);

  function search(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(`/home/products${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  }

  return <header className="gh-header">
    <a className="gh-skip-link" href="#main-content">Skip to content</a>
    <div className="gh-announcement">A little less scrolling. A lot more playing. <span>Welcome to Gamehouse Kenya.</span></div>
    <div className="gh-header-main gh-container">
      <Link className="gh-brand" to="/home" aria-label="Gamehouse Kenya home"><BrandLogo /></Link>
      <form className="gh-search" role="search" onSubmit={search}>
        <Icon name="search" size={20} />
        <label className="gh-sr-only" htmlFor="store-search">Search games and toys</label>
        <input id="store-search" type="search" placeholder="Find your next favourite game…" value={query} onChange={event => setQuery(event.target.value)} />
        <button type="submit" aria-label="Search games and toys"><Icon name="arrow" size={20} /></button>
      </form>
      <div className="gh-header-actions"><ThemeToggle />
        <div className="gh-account" ref={accountRef}>
          <button className="gh-account-button" aria-label={user ? 'My account' : 'Account'} aria-expanded={dropdown} aria-controls="account-links" onClick={() => setDropdown(value => !value)}><Icon name="user" /><span>{user ? 'My account' : 'Account'}</span></button>
          {dropdown && <div className="gh-account-menu" id="account-links">
            {user ? <><Link to="/profile">My profile</Link><Link to="/myorders">My orders</Link></> : <><Link to="/auth/login">Sign in</Link><Link to="/auth/signup">Create account</Link></>}
            {isSeller && <><Link to={`/home/products?sellerEmail=${encodeURIComponent(user.email)}`}>My stock</Link><Link to="/home/product">Add product</Link><Link to="/inventory">Inventory</Link>{user.role === 'SUPERUSER' && <><Link to="/home/department/create">Add department</Link><Link to="/home/category/create_category">Add category</Link></>}<Link to="/orders">Customer orders</Link><Link to="/adverts">Manage adverts</Link></>}
          </div>}
        </div>
        <Link className="gh-cart-link" to="/cart" aria-label="Shopping bag"><Icon name="bag" /><span>Bag</span></Link>
      </div>
    </div>
    <nav className="gh-desktop-nav gh-container" aria-label="Shop navigation">
      <NavLink to="/home" end>Home</NavLink>
      <NavLink to="/home/products">Shop all <Icon name="arrow" size={14} /></NavLink>
      <Link to="/home#find-your-play">Find your kind of play</Link>
      <Link to="/home/products?q=board">Board games</Link>
      <Link to="/home/products?q=puzzle">Puzzles</Link>
      <Link to="/home/products?q=toy">Toys & discovery</Link>
      <span className="gh-nav-note"><span /> For every kind of player</span>
    </nav>
  </header>;
}
