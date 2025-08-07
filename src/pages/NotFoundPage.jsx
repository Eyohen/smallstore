import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary inline-block">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;