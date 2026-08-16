import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="container page" style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
      <EmptyState
        icon="search"
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={<Button as={Link} to="/">Back to home</Button>}
      />
    </div>
  );
}
