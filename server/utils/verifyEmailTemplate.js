const verifyEmailTemplate = ({name, url}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear ${name},</p>
      <p>Thank you for registering with Binkeyit.</p>
      <a href=${url} style="display: inline-block; padding: 10px 20px; color: white; background-color: blue; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        Verify Email
      </a>
    </div>
  `;
};

export default verifyEmailTemplate;
