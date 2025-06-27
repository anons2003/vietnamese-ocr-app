# 🚀 Hướng dẫn đẩy Vietnamese OCR App lên GitHub

## 📋 Chuẩn bị

Trước khi bắt đầu, đảm bảo bạn đã:
- ✅ Có tài khoản GitHub
- ✅ Đã cài đặt Git trên máy tính
- ✅ Đã cấu hình Git với tên và email của bạn

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🆕 Bước 1: Tạo Repository trên GitHub

1. **Truy cập GitHub**: Mở [github.com](https://github.com) và đăng nhập

2. **Tạo repository mới**:
   - Nhấp nút **"New"** (màu xanh) hoặc **"+"** → **"New repository"**
   
3. **Điền thông tin repository**:
   - **Repository name**: `vietnamese-ocr-app` (hoặc tên bạn muốn)
   - **Description**: `🇻🇳 Modern OCR Web Application with Vietnamese Support`
   - **Visibility**: 
     - ✅ **Public** (khuyến nghị - để mọi người có thể xem và đóng góp)
     - 🔒 **Private** (nếu bạn muốn giữ riêng tư)

4. **⚠️ QUAN TRỌNG - KHÔNG check các option sau**:
   - ❌ **KHÔNG** check "Add a README file" (chúng ta đã có README.md)
   - ❌ **KHÔNG** check "Add .gitignore" (chúng ta đã có .gitignore)
   - ❌ **KHÔNG** chọn license (có thể thêm sau)

5. **Nhấp "Create repository"**

## 📋 Bước 2: Copy Repository URL

Sau khi tạo repository, GitHub sẽ hiển thị trang với hướng dẫn. Hãy copy URL của repository:

- **HTTPS**: `https://github.com/yourusername/vietnamese-ocr-app.git`
- **SSH**: `git@github.com:yourusername/vietnamese-ocr-app.git`

## 🚀 Bước 3: Push Code lên GitHub

### Phương pháp 1: Sử dụng Script tự động (Khuyến nghị)

```bash
# Chạy script với URL repository của bạn
./push-to-github.sh https://github.com/yourusername/vietnamese-ocr-app.git
```

### Phương pháp 2: Thực hiện thủ công

```bash
# 1. Đảm bảo branch chính là main
git branch -M main

# 2. Thêm remote origin
git remote add origin https://github.com/yourusername/vietnamese-ocr-app.git

# 3. Push code lên GitHub
git push -u origin main
```

## ✅ Bước 4: Xác nhận thành công

Sau khi push thành công, hãy:

1. **Truy cập repository** trên GitHub
2. **Kiểm tra files**: Đảm bảo tất cả files đã được upload
3. **Xem README**: GitHub sẽ hiển thị README.md đẹp mắt
4. **Kiểm tra commits**: Xem lịch sử commits

## 🎨 Bước 5: Tùy chỉnh Repository (Tùy chọn)

### Thêm Topics
Trong repository GitHub, nhấp **⚙️ Settings** → **General** → **Topics**:
- `ocr`
- `vietnamese`
- `nextjs`
- `typescript`
- `tesseract`
- `react`
- `tailwindcss`

### Thêm Description
Cập nhật description: `🇻🇳 Modern OCR Web Application with Vietnamese Support - Extract text from images with 15 language support`

### Thêm Website URL
Nếu bạn deploy lên Vercel/Netlify, thêm URL vào phần **Website**

## 🚀 Bước 6: Deploy lên Vercel (Khuyến nghị)

1. **Truy cập [vercel.com](https://vercel.com)**
2. **Đăng nhập** bằng GitHub account
3. **Import repository**: Chọn `vietnamese-ocr-app`
4. **Deploy**: Vercel sẽ tự động build và deploy
5. **Nhận URL**: Bạn sẽ có URL live như `https://vietnamese-ocr-app.vercel.app`

## 🔧 Xử lý lỗi thường gặp

### Lỗi: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/yourusername/vietnamese-ocr-app.git
```

### Lỗi: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Lỗi: Authentication failed
- **HTTPS**: Sử dụng Personal Access Token thay vì password
- **SSH**: Đảm bảo SSH key đã được thêm vào GitHub

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. **Kiểm tra Git status**: `git status`
2. **Xem remote**: `git remote -v`
3. **Kiểm tra commits**: `git log --oneline`
4. **Liên hệ**: Tạo issue trong repository

## 🎉 Hoàn thành!

Sau khi hoàn thành, bạn sẽ có:
- ✅ Repository công khai trên GitHub
- ✅ Code được backup an toàn
- ✅ Có thể chia sẻ với cộng đồng
- ✅ Sẵn sàng deploy và sử dụng
- ✅ Có thể nhận contributions từ developers khác

**Chúc mừng! Vietnamese OCR App của bạn đã sẵn sàng cho thế giới! 🌍🇻🇳**
