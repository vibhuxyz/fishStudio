// export const userForgetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   ) => {
//   //@ts-ignore
//   await handleForgetPassword(req, res, next, "user");
// };

// export const verifyUserForgetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   ) => {
//   await verifyForgetPasswordOtp(req, res, next);
// };

// export const resetUserPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   ) => {
//   try {
//     const { email, newPassword } = req.body;

//     if (!email || !newPassword) {
//       throw new ValidationError("All fields are required");
//     }

//     const user = await prisma.users.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       throw new AuthError("User not found!!");
//     }

//     const isSamePassword = await bcrypt.compare(newPassword, user.password!);

//     if (isSamePassword) {
//       throw new ValidationError(
//         "New Password cannot be the same as the old password",
//       );
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await prisma.users.update({
//       where: {
//         email,
//       },
//       data: {
//         password: hashedPassword,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Password reset successfully Done!",
//     });
//   } catch (error) {
//     next(error);
//   }

//   //@ts-ignore
//   await handleResetPassword(req, res, next, "user");
// };
//
//
//

// export const userLogin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   ) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       throw new ValidationError("All fields are required");
//     }

//     const user = await prisma.users.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       throw new AuthError("User not found!!  Please Register");
//     }

//     // check password
//     const isPasswordMatch = await bcrypt.compare(password, user.password!);

//     if (!isPasswordMatch) {
//       throw new AuthError("Invalid credentials Password Incorrect");
//     }

//     // generate access or refresh token
//     const accessToken = jwt.sign(
//       { id: user.id, role: "user" },
//       process.env.ACCESS_TOKEN_JWT_SECRET_KEY!,
//       { expiresIn: "10m" },
//     );
//     const refreshToken = jwt.sign(
//       { id: user.id, role: "user" },
//       process.env.REFRESH_TOKEN_JWT_SECRET_KEY!,
//       { expiresIn: "7d" },
//     );

//     // store the refresh and access token in an httponly secure
//     setCookie(res, "refresh_token", refreshToken);
//     setCookie(res, "access_token", accessToken);

//     res.status(200).json({
//       success: true,
//       message: "User logged in successfully",
//       user: { id: user.id, name: user.name, email: user.email },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
//
//
