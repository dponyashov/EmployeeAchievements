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
    path: '/news',
    title: 'Новости',
    icon: '📰',
    allowedRoles: ['ROLE_USER', 'ROLE_NEWSMAKER', 'ROLE_ADMIN'],
  },
  {
    path: '/bookings',
    title: 'Переговорные',
    icon: '🏢',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
  },
  {
    path: '/admin',
    title: 'Администрирование',
    icon: '🛠️',
    allowedRoles: ['ROLE_ADMIN'],
  },
  {
    path: '/directories/profile',
    title: 'Сотрудники и кадры',
    icon: '👥',
    allowedRoles: ['ROLE_SUPERVISOR', 'ROLE_ADMIN'],
  },
  {
    title: 'Тестирование',
    path: '/testing',
    icon: '🎓',
    allowedRoles: ['ROLE_TEST', 'ROLE_TEST_CONTROL', 'ROLE_TEST_ADMIN', 'ROLE_ADMIN'],
  },
  {
    path: '/achievements',
    title: 'Задачи сотрудников',
    icon: '✅',
    allowedRoles: [
      'ROLE_USER',
      'ROLE_SUPERVISOR',
      'ROLE_DEPARTMENT_ALL',
      'ROLE_REPORT',
      'ROLE_ADMIN',
    ],
  },
];
