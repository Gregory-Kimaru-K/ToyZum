import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import Icon from '../storefront/Icon';
import '../../styles/mobilenav.css';

export default function Mobilebar() {
  const { user } = useContext(AuthContext);
  return <nav className="gh-mobile-nav" aria-label="Mobile navigation">
    <NavLink to="/home" end><Icon name="home" /><span>Home</span></NavLink>
    <NavLink to="/home/products"><Icon name="grid" /><span>Explore</span></NavLink>
    <NavLink to="/cart"><Icon name="bag" /><span>Bag</span></NavLink>
    <NavLink to={user ? '/profile' : '/auth/login'}><Icon name="user" /><span>Account</span></NavLink>
  </nav>;
}
