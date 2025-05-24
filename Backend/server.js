import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware cho multipart/form-data
const upload = multer();

// Cấu hình transporter với Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hocde99@gmail.com", // Thay bằng email gửi
    pass: "tsqz fuuu ekhw fbbi" // Thay bằng app password Gmail
  }
});

app.post("/Contact/SubmitForm", upload.none(), async (req, res) => {
  console.log(req.body, '========'); // Bây giờ sẽ log ra đúng dữ liệu form
  const { FullName, Email, Comment } = req.body;
  const mailOptions = {
    from: 'Landing Page <yourgmail@gmail.com>',
    to: 'khahoangmkit@gmail.com',
    subject: 'Thông tin liên hệ mới từ Landing Page',
    text: `Tên: ${FullName}\nEmail: ${Email}\nNội dung: ${Comment}`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ Message: "Gửi mail thành công!" });
  } catch (error) {
    res.json({ Message: "Gửi mail thất bại!" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
