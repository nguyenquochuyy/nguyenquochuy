import { useState, useEffect } from 'react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  text: string;
}

export const usePasswordStrength = (password: string) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-300',
    text: 'Rất yếu'
  });

  useEffect(() => {
    const calculateStrength = (): PasswordStrength => {
      let score = 0;
      const feedback: string[] = [];

      // Length check
      if (password.length >= 8) {
        score += 1;
      } else {
        feedback.push('Mật khẩu cần ít nhất 8 ký tự');
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        feedback.push('Cần ít nhất 1 chữ hoa');
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        feedback.push('Cần ít nhất 1 chữ thường');
      }

      // Number check
      if (/\d/.test(password)) {
        score += 1;
      } else {
        feedback.push('Cần ít nhất 1 số');
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
      } else {
        feedback.push('Cần ít nhất 1 ký tự đặc biệt');
      }

      // Length bonus
      if (password.length >= 12) {
        score += 1;
      }

      let color = 'bg-red-500';
      let text = 'Rất yếu';

      if (score >= 5) {
        color = 'bg-green-500';
        text = 'Rất mạnh';
      } else if (score >= 4) {
        color = 'bg-lime-500';
        text = 'Mạnh';
      } else if (score >= 3) {
        color = 'bg-yellow-500';
        text = 'Trung bình';
      } else if (score >= 2) {
        color = 'bg-orange-500';
        text = 'Yếu';
      }

      return { score, feedback, color, text };
    };

    setStrength(calculateStrength());
  }, [password]);

  return strength;
};
