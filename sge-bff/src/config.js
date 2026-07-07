import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3020,
  jwtSecret: process.env.JWT_SECRET || "sge-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  gamBaseUrl: process.env.GAM_BASE_URL || "",
  genexusRestBaseUrl: process.env.GENEXUS_REST_BASE_URL || "",
  mockMode: process.env.MOCK_MODE !== "false",
};
