import { Token } from "./types";
import { env } from "cloudflare:workers";

export const encrypt = async (data: Token): Promise<string> => {
  const encrypt_key = env.encrypt_key;

  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(encrypt_key),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encoded
  );

  const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...buffer));
};

export const decrypt = async (token: string): Promise<Token> => {
  const encrypt_key = env.encrypt_key;

  const data = atob(token);
  const buffer = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    buffer[i] = data.charCodeAt(i);
  }

  const iv = buffer.slice(0, 12);
  const encrypted = buffer.slice(12);

  const result = await crypto.subtle
    .importKey("raw", new TextEncoder().encode(encrypt_key), { name: "AES-GCM" }, false, ["decrypt"])
    .then((cryptoKey) =>
      crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        cryptoKey,
        encrypted
      )
    )
    .then((decrypted) => {
      const decoded = new TextDecoder().decode(decrypted);
      return JSON.parse(decoded) as Token;
    });

  return result as Token;
};

export const encryptPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};
