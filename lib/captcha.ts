"use server";

import crypto from "crypto";

const CAPTCHA_SECRET = process.env.NEXTAUTH_SECRET || "flowers_foryou_secure_antibot_secret_2026";

export interface CaptchaChallenge {
  question: string;
  token: string;
  num1: number;
  num2: number;
}

/**
 * Genera un nuevo desafío matemático aleatorio con token firmado criptográficamente.
 */
export async function generateCaptchaChallengeAction(): Promise<CaptchaChallenge> {
  const num1 = Math.floor(Math.random() * 9) + 2; // 2 a 10
  const num2 = Math.floor(Math.random() * 9) + 1; // 1 a 9
  const sum = num1 + num2;
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(4).toString("hex");

  const payload = `${sum}:${timestamp}:${nonce}`;
  const signature = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");

  return {
    question: `${num1} + ${num2}`,
    token,
    num1,
    num2,
  };
}

/**
 * Valida la respuesta del usuario al CAPTCHA y retorna un verificationToken firmado si es correcta.
 */
export async function verifyCaptchaSolutionAction(
  userAnswer: string | number,
  token: string,
  honeypot?: string
): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
  // 1. Trampa Honeypot: si el campo invisible fue llenado por un robot, rechazar silenciosamente
  if (honeypot && honeypot.trim().length > 0) {
    return { success: false, error: "Acceso no autorizado detectado." };
  }

  if (!token || userAnswer === undefined || userAnswer === null) {
    return { success: false, error: "Datos de verificación incompletos." };
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [expectedSumStr, timestampStr, nonce, signature] = decoded.split(":");

    if (!expectedSumStr || !timestampStr || !nonce || !signature) {
      return { success: false, error: "Token de seguridad inválido." };
    }

    // Verificar firma HMAC
    const expectedPayload = `${expectedSumStr}:${timestampStr}:${nonce}`;
    const calculatedSignature = crypto.createHmac("sha256", CAPTCHA_SECRET).update(expectedPayload).digest("hex");

    if (calculatedSignature !== signature) {
      return { success: false, error: "Firma de seguridad inválida." };
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // Verificación de expiración (15 minutos)
    if (now - timestamp > 15 * 60 * 1000) {
      return { success: false, error: "El código de verificación ha expirado. Recarga el captcha." };
    }

    // Verificación de respuesta
    const parsedUserAnswer = parseInt(userAnswer.toString().trim(), 10);
    const expectedSum = parseInt(expectedSumStr, 10);

    if (isNaN(parsedUserAnswer) || parsedUserAnswer !== expectedSum) {
      return { success: false, error: "Respuesta incorrecta. Inténtalo de nuevo." };
    }

    // Generar verificationToken de éxito firmado para createOrder
    const verifiedTimestamp = Date.now();
    const verifiedPayload = `VERIFIED:${timestamp}:${verifiedTimestamp}:${nonce}`;
    const verifiedSignature = crypto.createHmac("sha256", CAPTCHA_SECRET).update(verifiedPayload).digest("hex");
    const verificationToken = Buffer.from(`${verifiedPayload}:${verifiedSignature}`).toString("base64");

    return {
      success: true,
      verificationToken,
    };
  } catch (err) {
    return { success: false, error: "Error al validar verificación de seguridad." };
  }
}

/**
 * Valida en createOrder que el pedido incluya un verificationToken legítimo y que el honeypot esté vacío.
 */
export function validateOrderSecurity(verificationToken?: string, honeypot?: string): { valid: boolean; reason?: string } {
  // 1. Validar trampa Honeypot
  if (honeypot && honeypot.trim().length > 0) {
    return { valid: false, reason: "Honeypot trap triggered by automated bot." };
  }

  // 2. Validar token de verificación
  if (!verificationToken) {
    return { valid: false, reason: "Missing security verification token." };
  }

  try {
    const decoded = Buffer.from(verificationToken, "base64").toString("utf-8");
    const [prefix, initialTimeStr, verifiedTimeStr, nonce, signature] = decoded.split(":");

    if (prefix !== "VERIFIED" || !initialTimeStr || !verifiedTimeStr || !nonce || !signature) {
      return { valid: false, reason: "Malformed verification token." };
    }

    const expectedPayload = `VERIFIED:${initialTimeStr}:${verifiedTimeStr}:${nonce}`;
    const calculatedSignature = crypto.createHmac("sha256", CAPTCHA_SECRET).update(expectedPayload).digest("hex");

    if (calculatedSignature !== signature) {
      return { valid: false, reason: "Invalid token signature." };
    }

    const verifiedTime = parseInt(verifiedTimeStr, 10);
    // Válido por hasta 20 minutos desde la resolución del captcha
    if (Date.now() - verifiedTime > 20 * 60 * 1000) {
      return { valid: false, reason: "Security token expired." };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, reason: "Verification decoding error." };
  }
}
