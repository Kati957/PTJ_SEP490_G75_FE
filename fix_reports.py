from pathlib import Path
import re
path = Path('src/pages/admin/AdminReportManagementPage.tsx')
text = path.read_text(encoding='utf-8')
replacements = {
    "KhA'ng th ¯Ÿ t §œi danh sA­ch report ch ¯? x ¯- lA«": "Không thể tải danh sách report chờ xử lý",
    "KhA'ng th ¯Ÿ t §œi danh sA­ch report ŽAœ x ¯- lA«": "Không thể tải danh sách report đã xử lý",
    "KhA'ng th ¯Ÿ t §œi danh sA­ch bAÿo cA­o h ¯Ø th ¯
g": "Không thể tải danh sách báo cáo hệ thống",
    "KhA'ng th ¯Ÿ t §œi chi tiA¤t bAÿi ŽŽŸng b ¯< bA­o cA­o": "Không thể tải chi tiết bài đăng bị báo cáo",
    "KhA'ng th ¯Ÿ t §œi chi tiA¤t report": "Không thể tải chi tiết report",
    "ĐÃ xá»­ lÃ½ report thÃ nh cÃ´ng": "Đã xử lý report thành công",
    "KhA'ng th ¯Ÿ x ¯- lA« report": "Không thể xử lý report",
    "ĐÃ ca¤p nha¤t bAÿo cA­o h ¯Ø th ¯
g": "Đã cập nhật báo cáo hệ thống",
    "KhA'ng th ¯Ÿ ca¤p nha¤t bAÿo cA­o h ¯Ø th ¯
g": "Không thể cập nhật báo cáo hệ thống",
    "Ch §ún bAÿi ŽŽŸng": "Chặn bài đăng",
    " §\"n bAÿi ŽŽŸng": "Ẩn bài đăng",
    "C §œnh bA­o": "Cảnh báo",
    "B ¯? qua": "Bỏ qua",
    "BÃ i Ä‘Äng nhÃ  tuyá»ƒn dá»¥ng": "Bài đăng nhà tuyển dụng",
    "BÃ i Ä‘Äng á»©ng viÃªn": "Bài đăng ứng viên",
    "NgÆ°á»i dÃ¹ng": "Người dùng",
    "Lo §­i": "Loại",
    "Ng’ø ¯?i bA­o cA­o": "Người báo cáo",
    "M ¯c tiA¦u": "Mục tiêu",
    "LÃ½ do": "Lý do",
    "NgÃ y táº¡o": "Ngày tạo",
    "HÃ nh Ä‘á»™ng": "Hành động",
    "Cho x ¯- lA«": "Chờ xử lý",
    "ĐÃ x ¯- lA«": "Đã xử lý",
    "TiÃªu Ä‘á»": "Tiêu đề",
    "Tráº¡ng thÃ¡i": "Trạng thái",
    "NgÃ y x ¯- lA«": "Ngày xử lý",
    "BÃ¡o cÃ¡o h ¯Ø th ¯
g": "Báo cáo hệ thống",
    "BÃ¡o cÃ¡o bÃ i Ä‘Äng tÃ¬m vá»‡c cá»§a ngÆ°á»i dÃ¹ng": "Báo cáo bài đăng tìm việc của người dùng",
    "XÃ¡c nha¤n": "Xác nhận",
    "Vui lÃ²ng chá»n hÃ nh Ä‘á»™ng": "Vui lòng chọn hành động",
    "Ghi chÃº x ¯- lA« (na¤u cÃ³)": "Ghi chú xử lý (nếu có)",
    "ĐÃ¡nh dáº¥u Ä‘Ã£ x ¯- lA«": "Đánh dấu đã xử lý",
    "Nha¤p ghi chÃº gá»­i  §a¤n ngÆ°á»i dÃ¹ng (na¤u cÃ³)": "Nhập ghi chú gửi đến người dùng (nếu có)",
    "ThÃ´ng tin bÃ¡o cÃ¡o h ¯Ø th ¯
g": "Thông tin báo cáo hệ thống",
    "ThÃ´ng tin report": "Thông tin report",
    "NgÆ°á»i bá»‹ bÃ¡o cÃ¡o": "Người bị báo cáo",
    "Vai trÃ² ngÆ°á»i bá»‹ bÃ¡o cÃ¡o": "Vai trò người bị báo cáo",
    "TiÃªu Ä‘á» bÃ i Ä‘Äng": "Tiêu đề bài đăng",
    "BÃ i Ä‘Äng bá»‹ bÃ¡o cÃ¡o": "Bài đăng bị báo cáo",
    "Má»Ÿ trang quáº£n lÃ½": "Mở trang quản lý",
    "Quáº£n lÃ½ bÃ¡o cÃ¡o h ¯Ø th ¯
g vÃ  bÃ i Ä‘Äng tuyá»ƒn dá»¥ng": "Quản lý báo cáo hệ thống và bài đăng tuyển dụng",
    "Gá»­m cáº£ bÃ¡o cÃ¡o bÃ i Ä‘Äng vÃ  bÃ¡o cÃ¡o h ¯Ø th ¯
g  §a¤ Ä‘á»ƒ quáº£n trá»‹ viÃªn x ¯- lA«.": "Gồm cả báo cáo bài đăng và báo cáo hệ thống để quản trị viên xử lý.",
    "Report chá» x ¯- lA«": "Report chờ xử lý",
    "Report ŽAœ x ¯- lA«": "Report đã xử lý",
    "Táº¥t cáº£ tráº¡ng thÃ¡i": "Tất cả trạng thái",
    "TÃ¬m theo tiÃªu Ä‘á», mÃ´ táº£ hoáº·c email...": "Tìm theo tiêu đề, mô tả hoặc email...",
    "Lá»c theo email admin x ¯- lA«...": "Lọc theo email admin xử lý...",
    "TÃ¬m theo email hoáº·c lÃ½ do...": "Tìm theo email hoặc lý do..."
}
for k,v in replacements.items():
    text = text.replace(k, v)
path.write_text(text, encoding='utf-8')
print('done')
