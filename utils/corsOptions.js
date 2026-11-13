import "dotenv/config";

const rawOrigins = process.env.ALLOWED_ORIGINS || "";

export const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim());

// console.log("Loaded CORS Origins:", allowedOrigins);

export const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
};

