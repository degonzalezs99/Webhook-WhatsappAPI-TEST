import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const normalizePhone = (phone) => {
  if (!phone) return null;

  // quitar todo lo que no sea número
  let clean = phone.replace(/\D/g, "");

  // asegurar que tenga código país CR (506)
  if (!clean.startsWith("506")) {
    clean = "506" + clean;
  }

  return clean;
};


export const formatPhoneForDB = (phone, defaultCountry = 'CR') => {
  if (!phone) return null;

  try {
    // si viene sin + (como WhatsApp)
    const normalized = phone.startsWith('+') ? phone : `+${phone}`;

    const parsed = parsePhoneNumberFromString(normalized, defaultCountry);

    if (!parsed || !parsed.isValid()) return null;

    const countryCode = `+${parsed.countryCallingCode}`;
    const national = parsed.nationalNumber;

    // 👇 lógica tipo CR (4-4), US (3-3-4), etc
    if (parsed.country === 'CR') {
      return `${countryCode} ${national.slice(0, 4)}-${national.slice(4)}`;
    }

    if (parsed.country === 'US') {
      return `${countryCode} (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
    }

    // fallback genérico
    return parsed.formatInternational().replace(/\s+/g, ' ');

  } catch (err) {
    return null;
  }
};