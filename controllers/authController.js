import axios from "axios";
import jwt from "jsonwebtoken"; // or you can verify tokens with google-auth-library

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const exchangeCodeForToken = async (req, res) => {
  const { code } = req.body;

  console.log(code);

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { id_token, access_token, refresh_token, expires_in } = tokenResponse.data;

    // Step 2: Verify the ID token to get user info
    // Here we can decode the JWT or use Google library to verify
    // For simplicity, decode (verify signature in production!)
    const decoded = jwt.decode(id_token);

    console.log(decoded)

    if (!decoded || decoded.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Invalid ID token" });
    }

    // Optional: Check if token expired or other claims

    // Step 3: Build your user object
    const user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      email_verified: decoded.email_verified,
    };

    // TODO: Here you can create or update user in your DB

    // Step 4: Respond with user info & tokens (or create your own session cookie)
    res.json({
      user,
      access_token,
      refresh_token,
      expires_in,
    });

  } catch (error) {
    console.error("Token exchange failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange token" });
  }
};
