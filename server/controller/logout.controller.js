/**
 * Logout Controller for handling user logout requests.
 * Invalidates user sessions and tokens as needed.
 */

export async function logout(req, res, next) {
  try {
    // Remove the auth cookie
    res.clearCookie("auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
