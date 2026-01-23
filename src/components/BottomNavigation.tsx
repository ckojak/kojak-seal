import { Home, ClipboardCheck, History, Award, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: ClipboardCheck, label: 'Selar', path: '/selar' },
  { icon: History, label: 'Histórico', path: '/historico' },
  { icon: Award, label: 'Certificado', path: '/certificado' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={22} 
                className={cn(
                  "transition-all duration-200",
                  isActive && "drop-shadow-[0_0_8px_hsl(134,100%,50%)]"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-glow"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
