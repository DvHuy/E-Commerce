const forgotPasswordTemplate = ({ name, otp }) => {
  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Forgot Password</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You requested to reset the password for your account. Your OTP code for verification is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 20px; font-weight: bold; color: #ff5722;">${otp}</span>
        </div>
        <p>Please enter this OTP in the system to continue the password reset process.</p>
        <p><strong>Note:</strong> The OTP will expire in 1 hours</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p>Best regards,</p>
        <p><strong>Support Team</strong></p>
      </div>
    `;
};

export default forgotPasswordTemplate;
