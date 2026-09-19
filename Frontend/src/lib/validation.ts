/**
 * International Form Validation & Masking Utilities for HUKI Inspire
 */

/**
 * Auto-masks input as dd/mm/yyyy
 * Example:
 *  "15" -> "15/"
 *  "1508" -> "15/08/"
 *  "15082002" -> "15/08/2002"
 */
export const maskDateOfBirth = (val: string, prevVal: string = ""): string => {
  // If user is deleting (backspace), allow smooth deletion without auto-readding slashes
  if (prevVal && val.length < prevVal.length) {
    // If deleted character is a slash, delete the digit preceding it as well
    if (prevVal.endsWith("/") && !val.endsWith("/")) {
      return val.slice(0, -1);
    }
    return val;
  }

  // Remove non-digit characters
  const digits = val.replace(/\D/g, "");

  if (digits.length === 0) return "";
  if (digits.length <= 2) {
    if (digits.length === 2) {
      return `${digits}/`;
    }
    return digits;
  }
  if (digits.length <= 4) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2);
    if (month.length === 2) {
      return `${day}/${month}/`;
    }
    return `${day}/${month}`;
  }

  // Length 5 to 8 (Year)
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${day}/${month}/${year}`;
};

/**
 * Validates Day/Month/Year strictly based on the calendar (including leap years)
 * and verifies age requirements (COPPA/GDPR 13+ and max 120).
 */
export interface BirthDateValidationResult {
  isValid: boolean;
  age?: number;
  error?: string;
}

export const validateBirthDate = (input: string): BirthDateValidationResult => {
  if (!input || !input.trim()) {
    return { isValid: false, error: "Vui lòng nhập ngày sinh (dd/mm/yyyy)" };
  }

  const str = input.trim();

  // If user entered a plain number (e.g., age 25)
  if (/^\d{1,3}$/.test(str)) {
    const age = parseInt(str, 10);
    if (age < 13) {
      return { isValid: false, error: "Bạn phải từ đủ 13 tuổi trở lên để sử dụng dịch vụ" };
    }
    if (age > 120) {
      return { isValid: false, error: "Độ tuổi không hợp lệ (tối đa 120 tuổi)" };
    }
    return { isValid: true, age };
  }

  const parts = str.split(/[\/\-]/);
  if (parts.length < 3) {
    return { isValid: false, error: "Vui lòng nhập đầy đủ ngày/tháng/năm sinh (dd/mm/yyyy)" };
  }

  let day: number, month: number, year: number;

  if (parts[0].length === 4) {
    // yyyy-mm-dd
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // dd/mm/yyyy or dd/mm/yy
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);

    // 2-digit year support
    if (year < 100) {
      const currentYY = new Date().getFullYear() % 100;
      year = year <= currentYY ? 2000 + year : 1900 + year;
    }
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { isValid: false, error: "Ngày sinh chỉ được chứa chữ số" };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Tháng sinh không hợp lệ (phải từ tháng 01 đến 12)" };
  }

  if (year < 1900) {
    return { isValid: false, error: "Năm sinh không hợp lệ (từ năm 1900 trở lại đây)" };
  }

  // Days in month validation (including Leap Year 29/02)
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDay = daysInMonth[month - 1];

  if (day < 1 || day > maxDay) {
    if (month === 2 && day === 29) {
      return { isValid: false, error: `Năm ${year} không phải năm nhuận, tháng 2 chỉ có 28 ngày` };
    }
    return { isValid: false, error: `Tháng ${month} năm ${year} chỉ có tối đa ${maxDay} ngày` };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  if (birthDate > today) {
    return { isValid: false, error: "Ngày sinh không thể ở tương lai" };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    return { isValid: false, error: "Bạn phải từ đủ 13 tuổi trở lên để sử dụng dịch vụ" };
  }

  if (age > 120) {
    return { isValid: false, error: "Độ tuổi vượt quá giới hạn hợp lệ (tối đa 120 tuổi)" };
  }

  return { isValid: true, age };
};

/**
 * Full Name Validation (Vietnamese & International Unicode Names)
 */
export const validateFullName = (name: string): string | undefined => {
  if (!name || !name.trim()) {
    return "Họ và tên không được để trống";
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự";
  }
  if (trimmed.length > 50) {
    return "Họ và tên không được vượt quá 50 ký tự";
  }
  // Disallow weird special characters like @#$%^*_+=<>~
  if (/[@#$%^*_+=<>~`|{}[\]\\;:"?]/.test(trimmed)) {
    return "Họ và tên không được chứa ký tự đặc biệt vô nghĩa";
  }
  return undefined;
};

/**
 * Email Validation (RFC 5322 standard regex)
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email || !email.trim()) {
    return "Email không được để trống";
  }
  const str = email.trim();
  if (/\s/.test(str)) {
    return "Email không được chứa khoảng trắng";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(str)) {
    return "Định dạng email không hợp lệ (ví dụ: name@domain.com)";
  }
  return undefined;
};

/**
 * Password Validation
 */
export const validatePassword = (password: string, isSignup: boolean = false): string | undefined => {
  if (!password) {
    return "Mật khẩu không được để trống";
  }
  if (isSignup) {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự theo tiêu chuẩn quốc tế";
    }
    // Check for letter and digit combination
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return "Mật khẩu cần kết hợp cả chữ cái và số để tăng tính bảo mật";
    }
  }
  return undefined;
};

/**
 * Create Pin: Title Validation (At least 10 characters)
 */
export const validatePinTitle = (title: string): string | undefined => {
  if (!title || !title.trim()) {
    return "Tiêu đề Ghim không được để trống";
  }
  const trimmed = title.trim();
  if (trimmed.length < 10) {
    return "Tiêu đề Ghim phải có ít nhất 10 ký tự";
  }
  if (trimmed.length > 150) {
    return "Tiêu đề Ghim không được vượt quá 150 ký tự";
  }
  return undefined;
};

/**
 * Create Pin: Description Validation (Required & at least 10 characters)
 */
export const validatePinDescription = (desc: string): string | undefined => {
  if (!desc || !desc.trim()) {
    return "Mô tả Ghim không được để trống (tối thiểu 10 ký tự)";
  }
  const trimmed = desc.trim();
  if (trimmed.length < 10) {
    return "Mô tả Ghim phải có ít nhất 10 ký tự để chia sẻ thông tin rõ ràng hơn";
  }
  if (trimmed.length > 500) {
    return "Mô tả Ghim không được vượt quá 500 ký tự";
  }
  return undefined;
};

/**
 * Create Pin: Image URL Validation
 */
export const validateImageUrl = (url: string): string | undefined => {
  if (!url || !url.trim()) {
    return "Vui lòng nhập đường dẫn ảnh";
  }
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
  }
  return undefined;
};

/**
 * Helper: Get max days in a specific month and year (calculates leap years)
 */
export const getMaxDaysInMonth = (month: number, year: number): number => {
  if (!month || month < 1 || month > 12) return 31;
  const validYear = year || new Date().getFullYear();
  const isLeap = (validYear % 4 === 0 && validYear % 100 !== 0) || validYear % 400 === 0;
  const days = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
};

/**
 * Helper: Validate Date of Birth from 3 dropdowns (Day, Month, Year)
 */
export const validateDMY = (
  day: number | string,
  month: number | string,
  year: number | string
): BirthDateValidationResult => {
  const d = typeof day === "string" ? parseInt(day, 10) : day;
  const m = typeof month === "string" ? parseInt(month, 10) : month;
  const y = typeof year === "string" ? parseInt(year, 10) : year;

  if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) {
    return { isValid: false, error: "Vui lòng chọn đầy đủ ngày, tháng và năm sinh" };
  }

  const maxDay = getMaxDaysInMonth(m, y);
  if (d < 1 || d > maxDay) {
    return { isValid: false, error: `Tháng ${m} năm ${y} chỉ có tối đa ${maxDay} ngày` };
  }

  const birthDate = new Date(y, m - 1, d);
  const today = new Date();

  if (birthDate > today) {
    return { isValid: false, error: "Ngày sinh không thể ở tương lai" };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    return { isValid: false, error: "Bạn phải từ đủ 13 tuổi trở lên để sử dụng dịch vụ" };
  }
  if (age > 120) {
    return { isValid: false, error: "Độ tuổi vượt quá giới hạn hợp lệ (tối đa 120 tuổi)" };
  }

  return { isValid: true, age };
};

