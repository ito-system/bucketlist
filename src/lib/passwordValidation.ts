export type PasswordValidationResult = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
};

export const PASSWORD_RULES = [
  { key: 'hasMinLength', label: '8文字以上' },
  { key: 'hasUppercase', label: '大文字（A-Z）を含む' },
  { key: 'hasLowercase', label: '小文字（a-z）を含む' },
  { key: 'hasNumber', label: '数字（0-9）を含む' },
  { key: 'hasSpecialChar', label: '特殊文字（!@#$% など）を含む' },
] as const;

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid:
      hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
  };
}
