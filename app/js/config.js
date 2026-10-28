// Cấu hình Firebase cho chế độ trực tuyến (nhiều thiết bị chơi cùng lúc).
// Để trống apiKey => app chạy ở "chế độ chạy thử": dữ liệu lưu ngay trên máy này,
// các tab trên cùng một máy vẫn có thể vào chung một phòng chơi.
// Xem HUONG-DAN.md để lấy các giá trị này từ Firebase Console.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Lịch sử đăng nhập của học viên: dán "đường liên kết điền sẵn" của Google Form vào đây
// (xem HUONG-DAN.md, mục "Lịch sử đăng nhập"). Form có các câu Trả lời ngắn theo đúng thứ tự:
// Họ tên, Lớp, rồi tùy chọn thêm Thiết bị, Thời gian. Để trống thì app vẫn chạy, lịch sử được giữ trên máy và gửi bù sau.
export const loginFormLink = 'https://docs.google.com/forms/d/e/1FAIpQLSdqFkXwXTrC4te-gsyQIPV9AOBDFl4c4p-kGD7x3mC7JudOrg/viewform?usp=pp_url&entry.28697070=a&entry.574100750=b';
