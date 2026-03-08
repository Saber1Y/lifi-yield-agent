import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ENCRYPTED_PREFIX = "enc:";

function getCipherKey() {
  const secret = process.env.AGENT_CONFIG_CIPHER_KEY;
  if (!secret) {
    return null;
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptConfigValue(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  const key = getCipherKey();
  if (!key) {
    throw new Error("AGENT_CONFIG_CIPHER_KEY is required to store Telegram credentials.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptConfigValue(value: string | null | undefined) {
  if (!value || !value.startsWith(ENCRYPTED_PREFIX)) {
    return value ?? null;
  }

  const key = getCipherKey();
  if (!key) {
    throw new Error("AGENT_CONFIG_CIPHER_KEY is required to read encrypted Telegram credentials.");
  }

  const payload = value.slice(ENCRYPTED_PREFIX.length);
  const [ivEncoded, authTagEncoded, encryptedEncoded] = payload.split(":");
  if (!ivEncoded || !authTagEncoded || !encryptedEncoded) {
    throw new Error("Encrypted config payload is malformed.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivEncoded, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
