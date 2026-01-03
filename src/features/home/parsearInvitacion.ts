// src/features/rooms/parseInvite.ts
export function parsearInvitacion(input: string): string | null {
  const raw = input.trim();

  // Si pegó URL con /invite/XXXX
  const match = raw.match(/\/invite\/([a-z0-9]+)/i);
  if (match?.[1]) return match[1].toUpperCase();

  // Si pegó solo el code
  const code = raw.replace(/\s+/g, "").toUpperCase();
  if (code.length < 4) return null; // regla mínima
  return code;
}
