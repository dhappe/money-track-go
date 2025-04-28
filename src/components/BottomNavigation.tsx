
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartPie, Wallet, Calendar, CreditCard } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t border-border h-16 flex items-center justify-around px-2 z-40">
      <NavItem to="/" icon={<ChartPie size={24} />} label="Dashboard" />
      <NavItem to="/transactions" icon={<Wallet size={24} />} label="Transações" />
      <AddButton />
      <NavItem to="/planning" icon={<Calendar size={24} />} label="Planejamento" />
      <NavItem to="/account" icon={<CreditCard size={24} />} label="Conta" />
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center justify-center w-[20%] py-1
        ${isActive ? 'text-primary' : 'text-muted-foreground'}
      `}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </NavLink>
  );
};

const AddButton: React.FC = () => {
  return (
    <NavLink
      to="/add-transaction"
      className="bg-primary rounded-full w-14 h-14 flex items-center justify-center -mt-5 shadow-md"
    >
      <span className="text-3xl text-primary-foreground font-semibold">+</span>
    </NavLink>
  );
};

export default BottomNavigation;
