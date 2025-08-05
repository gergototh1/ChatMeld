import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Settings, Github } from 'lucide-react';
import logoUrl from '../../chatmeld-logo.svg';

export const MainSidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'New Chat', href: '/new-chat', icon: MessageSquare },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gradient-secondary p-6 h-full overflow-y-auto shadow-modern-lg flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-white rounded-xl shadow-modern">
          <img src={logoUrl} alt="ChatMeld Logo" className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          ChatMeld
        </h1>
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-accent text-white shadow-modern'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-gray-700/50">
        <a
          href="https://github.com/balazspiller/ChatMeld"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
        >
          <Github className="w-4 h-4" />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
};
