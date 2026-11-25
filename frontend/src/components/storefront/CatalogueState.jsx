import Icon from './Icon';

export default function CatalogueState({ status, retry, emptyTitle = 'A little room for more play.', emptyText = 'Our shelves are being filled. Check back for games and toys soon.' }) {
  if (status === 'loading') return <div className="gh-loading" role="status" aria-label="Loading products">
    {[1, 2, 3, 4].map(item => <div className="gh-skeleton" key={item}><div /><span /><span /></div>)}
    <span className="gh-sr-only">Loading products…</span>
  </div>;
  return <div className="gh-catalogue-state" role="status">
    <Icon name={status === 'error' ? 'box' : 'dice'} size={32} />
    <h3>{status === 'error' ? 'The shelves are taking a moment.' : emptyTitle}</h3>
    <p>{status === 'error' ? 'We couldn’t load the catalogue. Please try again.' : emptyText}</p>
    {status === 'error' && <button className="gh-button gh-button-outline" onClick={retry}>Try again <Icon name="arrow" size={18} /></button>}
  </div>;
}
