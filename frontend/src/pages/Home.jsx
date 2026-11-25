import { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterComp from '../components/body/FooterComp';
import Icon from '../components/storefront/Icon';
import PlayArtwork from '../components/storefront/PlayArtwork';
import ProductCard from '../components/storefront/ProductCard';
import CatalogueState from '../components/storefront/CatalogueState';
import useCatalogue from '../hooks/useCatalogue';

const audiences = [
  { name: 'Kids', title: 'Big discoveries. Little hands.', description: 'Make room for imagination, curious questions and the joy of figuring things out.', categories: [{ name: 'Puzzles', q: 'puzzle', icon: 'grid' }, { name: 'Building & making', q: 'building', icon: 'box' }, { name: 'Toys & pretend play', q: 'toy', icon: 'dice' }], note: 'A world of little firsts', className: 'kids' },
  { name: 'Teens', title: 'Challenge accepted.', description: 'Brain teasers, friendly rivalries and something better to do with the whole crew.', categories: [{ name: 'Strategy games', q: 'strategy', icon: 'grid' }, { name: 'Card games', q: 'card', icon: 'dice' }, { name: 'Brain teasers', q: 'puzzle', icon: 'box' }], note: 'For curious minds', className: 'teens' },
  { name: 'Adults', title: 'Your kind of together time.', description: 'A date night for two, a friends’ meetup or a lively game night. Bring your people. We’ll bring the play ideas.', categories: [{ name: 'Couples & date nights', q: 'couple', icon: 'user' }, { name: 'Friends & meetups', q: 'party', icon: 'grid' }, { name: 'Drinking games', q: 'drinking', icon: 'dice' }, { name: 'Truth or dare', q: 'dare', icon: 'box' }], note: 'For grown-up get-togethers', className: 'adults' },
];

export default function Home() {
  const [audience, setAudience] = useState(0);
  const { products, categories, status, retry } = useCatalogue();
  const selected = audiences[audience];
  const picks = [...products.filter(product => product.featured), ...products.filter(product => !product.featured)].slice(0, 4);

  return <div className="gh-storefront">
    <div className="gh-container">
      <section className="gh-hero" aria-labelledby="hero-title">
        <div className="gh-hero-copy">
          <p className="gh-eyebrow"><span className="gh-dot" /> YOUR PEOPLE. YOUR PLAY.</p>
          <h1 id="hero-title">Life needs<br />a little <span>more play.</span></h1>
          <p>For the little explorers, the big thinkers, and the just-one-more-round crowd. Find games and toys that bring us together.</p>
          <div className="gh-hero-actions"><Link className="gh-button" to="/home/products">Let’s play <Icon name="arrow" size={19} /></Link><a className="gh-text-link" href="#find-your-play">Find your kind of fun <span>↗</span></a></div>
          <div className="gh-hero-footnote"><span className="gh-mini-dice"><Icon name="dice" size={17} /></span> All ages. All together.</div>
        </div>
        <div className="gh-hero-visual"><span className="gh-artwork-label">GOOD TIMES,<br />UNBOXED.</span><PlayArtwork /><span className="gh-play-stamp">Less screen time.<br /><strong>More together time.</strong></span></div>
      </section>
      <div className="gh-values" aria-label="Our collection"><p><Icon name="dice" size={20} /> Games for every generation</p><p><Icon name="grid" size={20} /> A little learning. A lot of fun.</p><p><Icon name="user" size={20} /> Made for time together</p></div>
      <section className="gh-section" id="find-your-play" aria-labelledby="discovery-title">
        <div className="gh-section-heading"><div><p className="gh-eyebrow">THERE’S A PLAYER IN EVERYONE</p><h2 id="discovery-title">Find your kind of play.</h2></div><p>Start with who you’re shopping for.</p></div>
        <div className="gh-audience-tabs" role="group" aria-label="Shopping inspiration by age group">{audiences.map((item, index) => <button key={item.name} aria-pressed={audience === index} onClick={() => setAudience(index)}>{item.name}<Icon name="arrow" size={17} /></button>)}</div>
        <div className={`gh-discovery gh-discovery-${selected.className}`}>
          <div className="gh-discovery-intro"><span className="gh-eyebrow">{selected.note}</span><h3>{selected.title}</h3><p>{selected.description}</p><span className="gh-discovery-hint">Explore by interest. Check each product for age suitability.</span></div>
          <div className="gh-interest-grid">{selected.categories.map(item => <Link key={item.name} to={`/home/products?q=${encodeURIComponent(item.q)}`}><span className="gh-interest-icon"><Icon name={item.icon} size={35} /></span><span>{item.name}</span><Icon name="arrow" size={19} /></Link>)}</div>
        </div>
      </section>
      {categories.length > 0 && <section className="gh-categories" aria-label="Browse categories"><span className="gh-eyebrow">EXPLORE THE SHELVES</span><div>{categories.map(category => <Link key={category.id} to={`/home/products?categoryId=${encodeURIComponent(category.slug)}`}>{category.name}<Icon name="arrow" size={15} /></Link>)}</div></section>}
      <section className="gh-section" aria-labelledby="shelf-title"><div className="gh-section-heading"><div><p className="gh-eyebrow">YOUR NEXT “ONE MORE ROUND”</p><h2 id="shelf-title">On the shelves.</h2></div><Link className="gh-text-link" to="/home/products">Explore all <Icon name="arrow" size={18} /></Link></div>
        {status === 'ready' && picks.length > 0 ? <div className="gh-product-grid">{picks.map(product => <ProductCard key={product.id} product={product} />)}</div> : <CatalogueState status={status} retry={retry} />}
      </section>
      <section className="gh-together"><div className="gh-together-symbol" aria-hidden="true">✳</div><div><p className="gh-eyebrow">PUT THE PHONE DOWN. PICK A GAME UP.</p><h2>The best connections<br />happen around a table.</h2><p>A family afternoon. A catch-up with friends. A quiet puzzle for one.<br className="gh-desktop-break" /> There’s always a good reason to play.</p><Link className="gh-button gh-button-light" to="/home/products">Make time for play <Icon name="arrow" size={19} /></Link></div><span className="gh-together-note">Everyone’s<br />invited. ↗</span></section>
    </div>
    <FooterComp />
  </div>;
}
