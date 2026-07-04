import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * This component redirects to the main order creation page.
 * The order creation flow is unified and exists only at the root route (/).
 * This ensures no logic duplication and consistent backend integration.
 */
export const NewOrder: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main order creation wizard page
    navigate('/quote', { replace: true });
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to order creation...</p>
      </div>
    </div>
  );
};
