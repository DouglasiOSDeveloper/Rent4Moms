import React from "react";
import { Clock } from "lucide-react";
import { generateDeliverySlots } from "../../domain/delivery/slots";
import type { DeliverySettings } from "../../domain/delivery/types";
import { cn } from "../prototype/PrototypeUI";

export function DeliverySlotSelect({ settings, value, onChange, required, error, disabled }: {
  settings: DeliverySettings;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const slots = generateDeliverySlots(settings);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="delivery-slot" className="text-sm font-medium text-foreground">
        Horário para receber a entrega{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <select
          id="delivery-slot"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-xl border bg-input-background pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none",
            error ? "border-destructive" : "border-border",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          <option value="">Selecione um horário</option>
          {slots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
        </select>
      </div>
      <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
        {error ?? `Janelas de 30 minutos entre ${settings.startTime} e ${settings.endTime}.`}
      </p>
    </div>
  );
}
