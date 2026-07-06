export function isRestaurantOpen(operatingHours: unknown, manualIsOpen: boolean): boolean {
  if (!manualIsOpen) return false;
  if (!operatingHours) return manualIsOpen;

  let hours = operatingHours;
  if (typeof operatingHours === 'string') {
    try {
      hours = JSON.parse(operatingHours);
    } catch {
      return manualIsOpen;
    }
  }

  if (!hours || typeof hours !== 'object') return manualIsOpen;

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = (hours as Record<string, { isOpen?: boolean; open?: string; close?: string }>)[currentDay];
  if (!todaySchedule) return manualIsOpen;
  if (todaySchedule.isOpen === false) return false;

  const openTime = todaySchedule.open;
  const closeTime = todaySchedule.close;
  if (!openTime || !closeTime) return manualIsOpen;

  const parseTime = (timeStr: string): number => {
    const [h, minutes] = timeStr.split(':').map(Number);
    return h * 60 + (minutes || 0);
  };

  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);

  if (closeMinutes > openMinutes) {
    return currentTime >= openMinutes && currentTime < closeMinutes;
  }

  return currentTime >= openMinutes || currentTime < closeMinutes;
}

export function getTodayHours(operatingHours: unknown): { open: string; close: string } | null {
  if (!operatingHours) return null;

  let hours = operatingHours;
  if (typeof operatingHours === 'string') {
    try {
      hours = JSON.parse(operatingHours);
    } catch {
      return null;
    }
  }

  if (!hours || typeof hours !== 'object') return null;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];
  const todaySchedule = (hours as Record<string, { isOpen?: boolean; open?: string; close?: string }>)[currentDay];

  if (!todaySchedule || todaySchedule.isOpen === false) return null;

  return {
    open: todaySchedule.open || '09:00',
    close: todaySchedule.close || '22:00',
  };
}
