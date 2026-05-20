export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email là bắt buộc";
  }
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Mật khẩu là bắt buộc";
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu";
  }
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp";
  }
  return null;
};

export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return "Họ và tên là bắt buộc";
  }
  if (fullName.trim().length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự";
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return "Số điện thoại là bắt buộc";
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 11) {
    return "Số điện thoại phải có 9-11 chữ số";
  }
  return null;
};
