import sgMail from '@sendgrid/mail';

import { ErrorHandler } from '../helpers/error';
import { User } from '../entity/user';

interface MailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
}

export class MailerService {
  sendViaSendGrid = async (options: MailOptions): Promise<void> => {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send(options);
    } catch (err) {
      throw new ErrorHandler(500, 'Error Sending mail');
    }
  };

  sendMail = async (options: MailOptions): Promise<void> => {
    const mailer = process.env.mailer ? process.env.mailer : 'sendgrid';

    switch (mailer) {
      case 'sendgrid': {
        this.sendViaSendGrid(options);
      }
    }
  };

  sendRecoveryMail = async (user: User): Promise<boolean> => {
    try {
      const link = process.env.PASSWORD_RESET_FORM_URL + user.resetPasswordToken;
      const mailOptions = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: 'Password change request',
        text: `Hi ${user.username} \n 
            Please click on the following link ${link} to reset your password. \n\n 
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      await this.sendMail(mailOptions);
      return true;
    } catch (err) {
      throw new ErrorHandler(500, 'Error Sending mail');
    }
  };

  sendPasswordChangedConfirmMail = async (user: User): Promise<boolean> => {
    try {
      const mailOptions = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: 'Your password has been changed',
        text: `Hi ${user.username} \n 
                This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      };
      await this.sendMail(mailOptions);
      return true;
    } catch (err) {
      throw new ErrorHandler(500, 'Error Sending mail');
    }
  };
}

export default new MailerService();
