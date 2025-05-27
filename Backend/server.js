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
            <p><strong>Tên:</strong> {{name}}</p>
            <p><strong>Email:</strong> {{email}}</p>
            <p><strong>Nội dung:</strong> {{comment}}</p>
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

// Form validation function
function validateForm(data) {
  const errors = [];
  
  if (!data.FullName || data.FullName.trim() === "") {
    errors.push("Vui lòng nhập tên");
  }
  
  if (!data.Email || data.Email.trim() === "") {
    errors.push("Vui lòng nhập email");
  } else {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.Email)) {
      errors.push("Email không hợp lệ");
    }
  }
  
  return errors;
}

// Form submission endpoint
app.post("/Contact/SubmitForm", upload.none(), async (req, res) => {
  try {
    console.log("Form submission received:", req.body);
    
    // Validate form data
    const { FullName, Email, Comment } = req.body;
    const validationErrors = validateForm(req.body);
    
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
      .replace("{{name}}", FullName)
      .replace("{{email}}", Email)
      .replace("{{comment}}", Comment || "Không có nội dung")
      .replace("{{timestamp}}", timestamp);
    
    // Configure email options
    const mailOptions = {
      from: 'Landing Page Thăng Long <hocde99@gmail.com>',
      to: 'khahoangmkit@gmail.com',
      subject: 'Thông tin liên hệ mới từ Landing Page',
      text: `Tên: ${FullName}\nEmail: ${Email}\nNội dung: ${Comment || "Không có nội dung"}`,
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
