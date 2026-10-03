import { useState, useRef, useEffect } from 'react';
import { Home, Shield, Settings, MoreVertical } from 'lucide-react';

interface MobileFormNavigationProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
  isFormView?: boolean;
}

export function MobileFormNavigation({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin, isFormView = false }: MobileFormNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!onNavigateHome && !onNavigateAdmin && !onNavigateSuperAdmin) {
    return null;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`fixed right-4 ${isFormView ? 'bottom-4' : 'top-4'}`}
      style={{ zIndex: 5 }}
      ref={menuRef}
    >
      {isMenuOpen && (
        <div
          className={`absolute ${isFormView ? 'bottom-14' : 'top-14'} right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] animate-slideUp`}
          style={{ zIndex: 100 }}
        >
          {onNavigateHome && (
            <>
              <button
                onClick={() => handleMenuItemClick(onNavigateHome)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Home className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-800">Home</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}
          {onNavigateAdmin && (
            <>
              <button
                onClick={() => handleMenuItemClick(onNavigateAdmin)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Shield className="w-5 h-5 text-slate-700" />
                <span className="font-medium text-gray-800">Admin</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}
          {onNavigateSuperAdmin && (
            <button
              onClick={() => handleMenuItemClick(onNavigateSuperAdmin)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-slate-900" />
              <span className="font-medium text-gray-800">Super Admin</span>
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-2xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 pointer-events-auto border-2 border-gray-300"
        style={{
          position: 'relative',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
        title="Menu"
        aria-label="Open menu"
      >
        <MoreVertical className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}
