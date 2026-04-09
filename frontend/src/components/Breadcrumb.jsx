import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  
  const breadcrumbs = React.useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    const crumbs = [{ label: 'Home', path: '/' }];
    let currentPath = '';
    
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = path
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      crumbs.push({ label, path: currentPath });
    });
    
    return crumbs;
  }, [location.pathname]);

  return (
    <nav className="flex items-center gap-1 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && <ChevronRight size={16} className="mx-1 opacity-50" />}
          {index === 0 ? (
            <Link to={crumb.path} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition">
              <Home size={16} />
            </Link>
          ) : index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-slate-900 dark:text-slate-100">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-slate-900 dark:hover:text-slate-100 transition">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
