const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true;

const normalizeAppPassword = (value) => value.replace(/\s+/g, "");

const createTransporter = () => {
  const { SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Konfigurasi SMTP belum lengkap. Isi SMTP_USER dan SMTP_PASS.");
  }

  const normalizedUser = SMTP_USER.trim();
  const normalizedPass = normalizeAppPassword(SMTP_PASS);

  if (!normalizedUser) {
    throw new Error("SMTP_USER kosong atau tidak valid.");
  }

  if (!normalizedPass) {
    throw new Error("SMTP_PASS kosong setelah normalisasi. Pastikan App Password Gmail diisi tanpa spasi.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: normalizedUser,
      pass: normalizedPass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
};

const { stripUploadPrefix } = require("../utils/fileName");

const resolveAttachment = (attachmentPath, attachmentName) => {
  if (!attachmentPath || typeof attachmentPath !== "string") {
    throw new Error("Path attachment tidak valid.");
  }

  const absolutePath = path.isAbsolute(attachmentPath)
    ? attachmentPath
    : path.join(__dirname, "../../", attachmentPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File attachment tidak ditemukan: ${absolutePath}`);
  }

  const stats = fs.statSync(absolutePath);

  if (!stats.isFile()) {
    throw new Error(`Attachment bukan file valid: ${absolutePath}`);
  }

  if (stats.size <= 0) {
    throw new Error(`File attachment kosong atau corrupt: ${absolutePath}`);
  }

  return {
    absolutePath,
    filename: attachmentName || stripUploadPrefix(path.basename(absolutePath)),
    size: stats.size,
  };
};

const sendDocumentEmail = async ({ to, subject, text, attachmentPath, attachmentName }) => {
  const transporter = createTransporter();
  const from = (process.env.SMTP_FROM || process.env.SMTP_USER).trim();
  const recipient = typeof to === "string" ? to.trim() : "";

  if (!recipient) {
    throw new Error("Email penerima tidak valid.");
  }

  const attachment = resolveAttachment(attachmentPath, attachmentName);

  console.log("[email] preparing mail", {
    from,
    to: recipient,
    subject,
    attachmentPath: attachment.absolutePath,
    attachmentSize: attachment.size,
    smtpHost: SMTP_HOST,
    smtpPort: SMTP_PORT,
    secure: SMTP_SECURE,
  });

  const verified = await transporter.verify();
  console.log("[email] smtp verify result", {
    verified,
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
  });

  const info = await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text,
    attachments: [
      {
        filename: attachment.filename,
        path: attachment.absolutePath,
      },
    ],
  });

  console.log("[email] sendMail result", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    envelope: info.envelope,
  });

  return {
    messageId: info.messageId,
    response: info.response,
    envelope: info.envelope,
    accepted: info.accepted,
    rejected: info.rejected,
  };
};

module.exports = {
  sendDocumentEmail,
};
