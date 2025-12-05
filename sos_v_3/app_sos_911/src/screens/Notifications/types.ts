export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'grupo' | 'clientes';
  group?: string;
  alertType?: 'sos' | '911' | 'unnecessary'; // Puede ser undefined si está pendiente
  status: 'pending' | 'sos' | '911' | 'unnecessary';
  location: { latitude: number; longitude: number };
  responseComment?: string;
}

export interface NotificationsProps {
  navigation: any; // Puedes mejorar esto con `NavigationProp` de React Navigation
}
