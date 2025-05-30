import { emailSchema, passwordSchema } from "../zod";

export const validateEmail = (value: string) => {
  try {
    emailSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

export const validatePassword = (value: string): boolean => {
  try {
    passwordSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
  return confirmPassword === password && confirmPassword.length > 0;
};