import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "../constants/app.constant.js";
import { prisma } from "../prisma/connect.prisma.js";
import { tokenService } from "../../services/token.service.js";

export const initLoginGooglePassport = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log("Bỏ qua Google Passport do chưa có GOOGLE_CLIENT_ID/SECRET");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async function (accessTokenGG, refreshTokenGG, profile, cb) {
        try {
          const fullName = profile.displayName;
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value;
          const isEmailVerified = profile.emails?.[0]?.verified ?? true;

          if (!email) {
            return cb(new Error("Không thể lấy email từ tài khoản Google"), null);
          }

          if (!isEmailVerified) {
            return cb(new Error("Email Google chưa được xác minh"), null);
          }

          let user = await prisma.nguoi_dung.findFirst({
            where: {
              email: email,
            },
          });

          if (!user) {
            user = await prisma.nguoi_dung.create({
              data: {
                ho_ten: fullName,
                google_id: googleId,
                email: email,
                anh_dai_dien: avatar || null,
              },
            });
          } else {
            const updatePayload = {};
            if (!user.google_id) updatePayload.google_id = googleId;
            if (!user.anh_dai_dien && avatar) updatePayload.anh_dai_dien = avatar;
            if (!user.ho_ten && fullName) updatePayload.ho_ten = fullName;

            if (Object.keys(updatePayload).length > 0) {
              user = await prisma.nguoi_dung.update({
                where: { nguoi_dung_id: user.nguoi_dung_id },
                data: updatePayload,
              });
            }
          }

          const accessToken = tokenService.createAccessToken(user.nguoi_dung_id);
          const refreshToken = tokenService.createRefreshToken(user.nguoi_dung_id);

          return cb(null, { accessToken, refreshToken, user });
        } catch (error) {
          return cb(error, null);
        }
      }
    )
  );
};
