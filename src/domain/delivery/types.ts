export interface DeliverySettings {
  startTime: string;
  endTime: string;
  slotMinutes: 30;
  timeZone: string;
}

export interface DeliverySlot {
  value: string;
  startTime: string;
  endTime: string;
  label: string;
}
