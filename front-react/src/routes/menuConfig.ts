import React from 'react';
import { AchievementsTile } from '../features/dashboard/tiles/AchievementsTile';
import { EmployeesTile } from '../features/dashboard/tiles/EmployeesTile';
import { BookingsTile } from '../features/dashboard/tiles/BookingsTile';
import { TestingTile } from '../features/dashboard/tiles/TestingTile';
import { NewsTile } from '../features/dashboard/tiles/NewsTile';
import { AdminTile } from '../features/dashboard/tiles/AdminTile';

export interface ErpMenuItem {
  path: string;
  title: string;
  icon: string;
  allowedRoles: string[];
  /** Исключить пункт из рабочего стола (например, саму ссылку на «Рабочий стол») */
  hideFromDashboard?: boolean;
  /** Уникальный ключ для хранения позиции в БД (по умолчанию берётся из path) */
  tileId?: string;
  /** Описание для автоматической плитки (если нет кастомного tileComponent) */
  tileDescription?: string;
  /** Переопределение маршрута при клике на плитку */
  tileRoute?: string;
  /** Кастомный компонент плитки со счётчиками (необязательно) */
  tileComponent?: React.FC<{ onClick: () => void }>;
}

export const erpMenuItems: ErpMenuItem[] = [
  {
    path: '/',
    title: 'Рабочий стол',
    icon: '🖥️',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
    hideFromDashboard: true,
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
    tileId: 'achievements',
    tileRoute: '/achievements?tab=tasks',
    tileComponent: AchievementsTile,
  },
  {
    path: '/directories/profile',
    title: 'Сотрудники и кадры',
    icon: '👥',
    allowedRoles: ['ROLE_SERVICE', 'ROLE_ADMIN'],
    tileId: 'employees',
    tileComponent: EmployeesTile,
  },
  {
    path: '/bookings',
    title: 'Переговорные и помещения',
    icon: '🗓️',
    allowedRoles: [
      'ROLE_USER',
      'ROLE_ADMIN',
      'ROLE_SERVICE',
      'ROLE_SUPERVISOR',
      'ROLE_DEPARTMENT_ALL',
    ],
    tileId: 'bookings',
    tileComponent: BookingsTile,
  },
  {
    path: '/testing',
    title: 'Тестирование сотрудников',
    icon: '📝',
    allowedRoles: ['ROLE_TEST', 'ROLE_TEST_CONTROL', 'ROLE_TEST_ADMIN', 'ROLE_ADMIN'],
    tileId: 'testing',
    tileComponent: TestingTile,
  },
  {
    path: '/news',
    title: 'Новости компании',
    icon: '📰',
    allowedRoles: ['ROLE_USER', 'ROLE_NEWSMAKER', 'ROLE_ADMIN'],
    tileId: 'news',
    tileComponent: NewsTile,
  },
  {
    path: '/admin',
    title: 'Администрирование',
    icon: '⚙️',
    allowedRoles: ['ROLE_ADMIN'],
    tileId: 'admin',
    tileComponent: AdminTile,
  },
];
