import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${APP_URL}/api/auth/google/callback`
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/auth/google/url", (req, res) => {
    // IMPORTANT: Strictly use only drive.file scope to limit access
    const scopes = [
      'https://www.googleapis.com/auth/drive.file'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Send tokens back to the opener window and close the popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'GOOGLE_AUTH_SUCCESS', 
                  tokens: ${JSON.stringify(tokens)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Sikeres bejelentkezés! Ez az ablak automatikusan be fog záródni.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).send("Hiba történt a Google bejelentkezés során.");
    }
  });

  app.post("/api/purchase", async (req, res) => {
    try {
      const { userEmail, courseName } = req.body;
      
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(500).json({ error: "Admin email not configured" });
      }

      // We'll just simulate sending if SMTP is not configured, 
      // but if it is, we'll send a real email.
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: adminEmail,
          subject: `Új vásárlási szándék: ${courseName}`,
          text: `Felhasználó (${userEmail}) szeretné megvásárolni a(z) "${courseName}" kurzust.\nKérlek vedd fel vele a kapcsolatot a számlázás és fizetés intézéséhez.`,
        });
      } else {
        console.log(`[SIMULATED EMAIL] To: ${adminEmail}, Subject: Új vásárlási szándék: ${courseName}, User: ${userEmail}`);
      }

      res.json({ success: true, message: "Email elküldve az adminnak." });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Hiba történt az email küldése során." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
