import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - limit each IP to 10 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: { Message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút" }
});

// Apply rate limiting to form submission route
app.use("/Contact/SubmitForm", limiter);

// Middleware for multipart/form-data
const upload = multer();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hocde99@gmail.com", // Your email
    pass: "tsqz fuuu ekhw fbbi" // Your app password
  }
});

// Load HTML email template
async function loadEmailTemplate() {
  try {
    const templatePath = join(__dirname, "email-template.html");
    return await fs.readFile(templatePath, "utf8");
  } catch (error) {
    console.error("Error loading email template:", error);
    // Return a basic template if file doesn't exist
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thông Tin Liên Hệ Mới</h2>
          </div>
          <div class="content">
            <p><strong>Tên:</strong> {{fullName}}</p>
            <p><strong>Điện thoại:</strong> {{phone}}</p>
            <p><strong>Email:</strong> {{email}}</p>
            <p><strong>Lời nhắn:</strong> {{message}}</p>
            <p><strong>Thời gian:</strong> {{timestamp}}</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động từ Landing Page Thăng Long</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Load HTML email template
async function loadEmailMEXETemplate() {
  try {
    const templatePath = join(__dirname, "email-mexe-template.html");
    return await fs.readFile(templatePath, "utf8");
  } catch (error) {
    console.error("Error loading email template:", error);
    // Return a basic template if file doesn't exist
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thông Tin Khách Hàng</h2>
          </div>
          <div class="content">
            <p><strong>Họ và Tên:</strong> {{fullName}}</p>
            <p><strong>Điện thoại:</strong> {{phone}}</p>
            <p><strong>Email:</strong> {{email}}</p>
            <p><strong>Sản phẩm quan tâm:</strong> {{product}}</p>
            <p><strong>Note: </strong> {{message}}</p>
            <p><strong>Thời gian:</strong> {{timestamp}}</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động từ Landing Page của MEXE Lab</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Form validation function
function validateForm(data) {
  const errors = [];
  
  if (!data.fullName || data.fullName.trim() === "") {
    errors.push("Vui lòng nhập họ và tên");
  }
  
  if (!data.phone || data.phone.trim() === "") {
    errors.push("Vui lòng nhập số điện thoại");
  } else {
    // Simple phone validation regex (e.g., Vietnamese phone numbers, 10 digits starting with 0)
    const phoneRegex = /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push("Số điện thoại không hợp lệ (cần đủ 10 số, bắt đầu bằng 0 và đúng định dạng nhà mạng Việt Nam)");
    }
  }
  
  if (data.email && data.email.trim() !== "") {
    // Simple email validation regex if email is provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email không hợp lệ");
    }
  }
  
  return errors;
}

// Form submission endpoint
app.post("/Contact/SubmitForm", upload.none(), async (req, res) => {
  try {
    console.log("Form submission received:", req.body);
    
    // Validate form data using field names from HTML form
    const { fullName, phone, email, message } = req.body;
    const validationErrors = validateForm({ fullName, phone, email, message });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        Message: `Lỗi: ${validationErrors.join(", ")}` 
      });
    }
    
    // Load and prepare email template
    let emailTemplate = await loadEmailTemplate();
    const timestamp = new Date().toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    emailTemplate = emailTemplate
      .replace("{{fullName}}", fullName)
      .replace("{{phone}}", phone || "Không cung cấp")
      .replace("{{email}}", email || "Không cung cấp")
      .replace("{{message}}", message || "Không có lời nhắn")
      .replace("{{timestamp}}", timestamp);
    
    // Configure email options
    const mailOptions = {
      from: 'Landing Page Thăng Long <hocde99@gmail.com>',
      to: 'khahoangmkit@gmail.com',
      subject: 'Thông tin liên hệ mới từ Landing Page',
      text: `Tên: ${fullName}\nSố điện thoại: ${phone || "Không cung cấp"}\nEmail: ${email || "Không cung cấp"}\nLời nhắn: ${message || "Không có lời nhắn"}\nThời gian: ${timestamp}`,
      html: emailTemplate
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    
    // Return success response
    res.json({ 
      success: true,
      Message: "Gửi thông tin liên hệ thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất." 
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false,
      Message: "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau." 
    });
  }
});

// Form MEXE submit
app.post("/mexe/SubmitForm", upload.none(), async (req, res) => {
  try {
    console.log("Form submission received:", req.body);

    // Validate form data using field names from HTML form
    const { fullName, phone, email, product, message } = req.body;
    const validationErrors = validateForm({ fullName, phone, email, message });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        Message: `Lỗi: ${validationErrors.join(", ")}`
      });
    }

    // Load and prepare email template
    let emailTemplate = await loadEmailMEXETemplate();
    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    emailTemplate = emailTemplate
      .replace("{{fullName}}", fullName)
      .replace("{{phone}}", phone || "Không cung cấp")
      .replace("{{email}}", email || "Không cung cấp")
      .replace("{{product}}", product || "Không cung cấp")
      .replace("{{message}}", message || "Không có lời nhắn")
      .replace("{{timestamp}}", timestamp);

    // Configure email options
    const mailOptions = {
      from: 'Landing Page MEXE LAB <hocde99@gmail.com>',
      to: 'khahoangmkit@gmail.com',
      subject: 'Thông tin liên hệ mới từ Landing Page',
      text: `Tên: ${fullName}\nSố điện thoại: ${phone || "Không cung cấp"}\nEmail: ${email || "Không cung cấp"}\nLời nhắn: ${message || "Không có lời nhắn"}\nThời gian: ${timestamp}`,
      html: emailTemplate
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    // Return success response
    res.json({
      success: true,
      Message: "Gửi thông tin liên hệ thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất."
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      Message: "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau."
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
