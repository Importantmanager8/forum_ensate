
export function isStrongPassword(passwd) {
  let minLength = 8;
  let hasUpper = /[A-Z]/.test(passwd);
  let hasLower = /[a-z]/.test(passwd);
  let hasNumber = /\d/.test(passwd);
  let hasSymbol = /[!@#$%^&*]/.test(passwd);

  return (
    passwd.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol
  );
}

