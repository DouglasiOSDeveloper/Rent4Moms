import React from "react";
import { Input } from "../prototype/PrototypeUI";

type InputProps = React.ComponentProps<typeof Input>;

export function MaskedInput({ mask, onChange, ...props }: Omit<InputProps, "onChange"> & {
  mask: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return <Input {...props} onChange={(value) => onChange(mask(value))} />;
}
