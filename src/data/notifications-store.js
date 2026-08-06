const NOTIFICATIONS_KEY = 'agua-plus-notifications';
const NOTIFICATIONS_EVENT = 'agua-plus-notifications-updated';

const now = () => new Date().toISOString();

const dispatchUpdate = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
};

const sortNotifications = (items) => {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? sortNotifications(JSON.parse(raw)) : [];
  } catch (error) {
    return [];
  }
};

const saveNotifications = (notifications) => {
  const sorted = sortNotifications(notifications);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sorted));
  dispatchUpdate();
  return sorted;
};

export const addNotification = ({ id, type = 'info', title, message, to = '/perfil', read = false }) => {
  const notifications = getNotifications();
  const nextNotification = {
    id: id || `${type}-${Date.now()}`,
    type,
    title,
    message,
    to,
    read,
    createdAt: now(),
  };

  const existingIndex = notifications.findIndex((notification) => notification.id === nextNotification.id);

  if (existingIndex >= 0) {
    notifications[existingIndex] = {
      ...notifications[existingIndex],
      ...nextNotification,
      createdAt: notifications[existingIndex].createdAt,
    };
    return saveNotifications(notifications);
  }

  return saveNotifications([nextNotification, ...notifications]);
};

export const ensureEmailVerificationNotification = () => {
  removeNotification('email-verified');

  return addNotification({
    id: 'verify-email',
    type: 'warning',
    title: 'Verifique seu e-mail',
    message: 'Confirme seu e-mail para ativar todos os recursos da sua conta.',
    to: '/perfil',
  });
};

export const ensureEmailVerifiedNotification = () => {
  removeNotification('verify-email');

  const notifications = getNotifications();

  if (notifications.some((notification) => notification.id === 'email-verified')) {
    return notifications;
  }

  return addNotification({
    id: 'email-verified',
    type: 'success',
    title: 'Conta verificada',
    message: 'Seu e-mail foi confirmado com sucesso.',
    to: '/perfil',
  });
};

export const markNotificationRead = (id) => {
  return saveNotifications(
    getNotifications().map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
  );
};

export const markAllNotificationsRead = () => {
  return saveNotifications(getNotifications().map((notification) => ({ ...notification, read: true })));
};

export const removeNotification = (id) => {
  return saveNotifications(getNotifications().filter((notification) => notification.id !== id));
};

export const removeNotificationsByPrefix = (prefix) => {
  return saveNotifications(getNotifications().filter((notification) => !notification.id.startsWith(prefix)));
};

export const clearNotifications = () => {
  localStorage.removeItem(NOTIFICATIONS_KEY);
  dispatchUpdate();
};

export const onNotificationsChange = (callback) => {
  window.addEventListener(NOTIFICATIONS_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(NOTIFICATIONS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};
