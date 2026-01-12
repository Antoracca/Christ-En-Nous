// utils/countryHelpers.web.ts
// Version WEB avec fallback simple pour getCallingCode

export const getCallingCode = async (countryCode: string): Promise<string> => {
  const callingCodes: Record<string, string> = {
    'CD': '243',
    'CG': '242',
    'FR': '33',
    'BE': '32',
    'CA': '1',
    'US': '1',
    'GB': '44',
    'DE': '49',
    'CF': '236',
  };

  return callingCodes[countryCode] || '1';
};
