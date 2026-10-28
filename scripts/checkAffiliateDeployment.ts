import dotenv from "dotenv";
dotenv.config();
const production = process.argv.includes("--production");
const checks: [string, boolean][] = [
  ["MONGO_URI", /^mongodb(\+srv)?:\/\//.test(process.env.MONGO_URI ?? "")],
  ["JWT_SECRET", !!process.env.JWT_SECRET && (!production || process.env.JWT_SECRET.length >= 32)],
  ["AFFILIATE_DESTINATION_KEY", /^[a-f0-9]{64}$/i.test(process.env.AFFILIATE_DESTINATION_KEY ?? "")],
  ["INTERNAL_SHARED_SECRET", !!process.env.INTERNAL_SHARED_SECRET && (!production || process.env.INTERNAL_SHARED_SECRET.length >= 32)],
  ["BASE_URL", !!process.env.BASE_URL && (!production || process.env.BASE_URL.startsWith("https://"))],
  ["SUPABASE_URL", !!process.env.SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", !!process.env.SUPABASE_SERVICE_ROLE_KEY],
  ["SMTP ou Gmail", !!((process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.MAIL_USER && process.env.MAIL_PASS))],
];
for (const [name, valid] of checks) console.log((valid ? "OK : " : "À CONFIGURER : ") + name);
if (checks.some(([, valid]) => !valid)) process.exitCode = 1;
