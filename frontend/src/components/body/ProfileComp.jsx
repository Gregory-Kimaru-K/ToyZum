import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import PageShell from '../ui/PageShell';
import { AccessState } from '../ui/Feedback';
import Icon from '../storefront/Icon';

export default function ProfileComp() {
  const { user, logoutUser } = useContext(AuthContext);
  const isSeller = ['SELLER', 'SUPERUSER'].includes(user?.role);
  const links = [{ to: '/myorders', icon: 'box', title: 'My orders', text: 'Keep track of your next good time.' }, { to: '/cart', icon: 'bag', title: 'My bag', text: 'Your favourites, saved for another round.' }, { to: '/settings', icon: 'user', title: 'Account settings', text: 'Your account details in one place.' }];
  return <PageShell title={user ? `Hello${user.first_name ? `, ${user.first_name}` : ', player'}.` : 'Your Gamehouse.'} description="A little home for all your good times.">{!user ? <AccessState /> : <><div className="gh-account-grid"><section className="gh-panel"><span className="gh-profile-avatar"><Icon name="user" size={30} /></span><h2>Your details</h2><dl className="gh-definition-list"><div><dt>Name</dt><dd>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{user.email || 'Not provided'}</dd></div><div><dt>Phone number</dt><dd>{user.phone_number || 'Not provided'}</dd></div></dl><button className="gh-text-link gh-signout" onClick={logoutUser}>Sign out <Icon name="arrow" size={17} /></button></section><div className="gh-account-links">{links.map(link => <Link className="gh-panel gh-account-link" key={link.to} to={link.to}><Icon name={link.icon} size={25} /><div><h2>{link.title}</h2><p>{link.text}</p></div><Icon name="arrow" size={18} /></Link>)}</div></div>{isSeller && <section className="gh-panel gh-management"><p className="gh-eyebrow">STORE MANAGEMENT</p><h2>Behind the good times.</h2><div><Link to={`/home/products?sellerEmail=${encodeURIComponent(user.email)}`}>My stock <Icon name="arrow" size={16} /></Link><Link to="/home/product">Add product <Icon name="arrow" size={16} /></Link><Link to="/inventory">Inventory <Icon name="arrow" size={16} /></Link><Link to="/orders">Customer orders <Icon name="arrow" size={16} /></Link>{user.role === 'SUPERUSER' && <><Link to="/home/department/create">Add department <Icon name="arrow" size={16} /></Link><Link to="/home/category/create_category">Create category <Icon name="arrow" size={16} /></Link></>}<Link to="/adverts">Create advert <Icon name="arrow" size={16} /></Link></div></section>}</>}</PageShell>;
}
