import { ReactNode } from 'react';
import { RootStackParamList } from '../../navigation/Navigator';

// Props para el componente Sidebar
export interface CustomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

// Estructura para los items del menú
export interface MenuItem {
  title: string;
  screen: keyof RootStackParamList;
  icon?: string; // Podemos agregar iconos más adelante
}