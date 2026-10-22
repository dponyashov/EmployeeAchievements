// src/routes/menuConfig.ts
export interface MenuItem {
  path: string;
  title: string;
  icon: string;
  allowedRoles: string[];
}

export const erpMenuItems: MenuItem[] = [
  {
    path: '/dashboard',
    title: 'Рабочий стол',
    icon: '🏠',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
  },
  {
    path: '/admin',
    title: 'Администрирование',
    icon: '🛠️',
    allowedRoles: ['ROLE_ADMIN'],
  },
  // 🌟 Добавляем выделенный раздел для кадрового учета
  {
    path: '/directories/profile',
    title: 'Сотрудники и кадры',
    icon: '👥',
    allowedRoles: ['ROLE_SUPERVISOR', 'ROLE_ADMIN'],
  },
  // Оставляем общий навигатор для должностей, отделов, услуг и компонентов
  {
    path: '/directories',
    title: 'Справочники (НСИ)',
    icon: '📚',
    allowedRoles: ['ROLE_SERVICE', 'ROLE_ADMIN'],
  },
  {
    path: '/reports',
    title: 'Отчеты и анализ',
    icon: '📊',
    allowedRoles: ['ROLE_REPORT', 'ROLE_ADMIN'],
  },
  {
    path: '/tasks',
    title: 'Мои задачи',
    icon: '✅',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
  },
];
