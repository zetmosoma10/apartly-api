import dayjs from "dayjs";
import { UserDocument } from "../entities/UserDocument";

function resetPasswordEmailTemplate(user: UserDocument, url: string) {
  return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <!-- Preheader -->
    <span style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
      You requested a password reset. This link expires in 15 minutes.
    </span>

    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f0f0f; padding: 40px 16px;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">

            <!-- Top accent bar -->
            <tr>
              <td style="background: linear-gradient(90deg, #FBBD23 0%, #f59e0b 50%, #FBBD23 100%); height: 4px; font-size: 0;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding: 48px 48px 32px 48px; text-align: center;">
                <!-- Warning icon mark -->
                <div style="display: inline-block; width: 56px; height: 56px; background-color: #2a2010; border: 2px solid #FBBD23; border-radius: 14px; line-height: 52px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 26px;">🔑</span>
                </div>
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Reset your password</h1>
                <p style="margin: 0; font-size: 15px; color: #888888; letter-spacing: 0.2px;">We received a request to reset your password.</p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 48px;">
                <div style="height: 1px; background-color: #2a2a2a;"></div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 48px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #cccccc; line-height: 1.7;">
                  Hey <strong style="color: #ffffff;">${user.firstName}</strong>,
                </p>
                <p style="margin: 0 0 28px 0; font-size: 15px; color: #aaaaaa; line-height: 1.7;">
                  Someone requested a password reset for your account. Click the button below to choose a new password. This link is only valid for the next <strong style="color: #FBBD23;">15 minutes</strong>.
                </p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                  <tr>
                    <td align="center">
                      <a href=${url}
                        style="display: inline-block; background-color: #FBBD23; color: #111111; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
                        Reset Password →
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback link -->
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="margin: 0 0 28px 0; word-break: break-all;">
                  <a href=${url} style="font-size: 13px; color: #FBBD23; text-decoration: none;">${url}</a>
                </p>

                <!-- Expiry warning box -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1f1a0d; border-radius: 10px; border: 1px solid #3d2f00; margin-bottom: 4px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 28px; vertical-align: middle;">
                            <span style="font-size: 18px;">⚠️</span>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 13px; color: #c89a3a; line-height: 1.6;">
                              This reset link will expire on <strong style="color: #FBBD23;">${dayjs(user.passwordResetTokenExpire).format("MMMM D, YYYY h:mm A")}</strong>. After that, you'll need to request a new one.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 48px;">
                <div style="height: 1px; background-color: #2a2a2a;"></div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td style="padding: 24px 48px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 18px;">🔒</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">
                        If you didn't request this, you can safely ignore this email — your password won't change. If you're concerned, <a href="${process.env.FRONTEND_URL}/support" style="color: #FBBD23; text-decoration: none;">contact support</a>.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #141414; padding: 24px 48px; text-align: center; border-top: 1px solid #2a2a2a;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #555555;">
                  © ${new Date().getFullYear()} <strong style="color: #666666;">${process.env.APP_NAME}</strong>. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #444444;">
                  <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                  &nbsp;·&nbsp;
                  <a href="${process.env.FRONTEND_URL}/privacy-policy" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                </p>
              </td>
            </tr>

          </table>
          <!-- /Card -->

        </td>
      </tr>
    </table>

  </body>
</html>
  `;
}

export default resetPasswordEmailTemplate;
