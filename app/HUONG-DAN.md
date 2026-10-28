# Hướng dẫn sử dụng – Học viện Anh hùng Mạng

App là một **web app cài được (PWA)**: mở bằng trình duyệt, sau đó cài lên điện thoại, máy tính bảng hoặc laptop như một ứng dụng thường. Không cần lên CH Play hay App Store.

## Cách dùng nhanh: chỉ cần gửi link

1. Gửi cho học sinh link: <https://dungptt-dng.github.io/hoc-vien-anh-hung-mang/>
2. Học sinh mở link → **Em là học viên** → nhập **họ tên** và **lớp** → chọn nhân vật → vào học. Không cần mã lớp, không cần tài khoản.
3. Tiến độ học của mỗi em được lưu ngay trên thiết bị em đang dùng. Một máy dùng chung vẫn được: em sau bấm **Đăng xuất** rồi nhập tên mình.
4. **Lịch sử đăng nhập** (họ tên, lớp, thiết bị, thời gian) tự ghi vào Google Trang tính của giáo viên qua Google Form (cách tạo ở dưới). App ghi 1 dòng mỗi lần học sinh đăng nhập, và 1 dòng khi mở lại app (cách nhau ít nhất 30 phút).

### Tạo Google Form để nhận lịch sử đăng nhập (khoảng 3 phút, làm 1 lần)
1. Vào <https://forms.google.com> → **Trống** (Blank). Đặt tên, ví dụ `Lịch sử đăng nhập Học viện`.
2. Tạo **4 câu hỏi kiểu "Trả lời ngắn"**, **đúng thứ tự**: `Họ tên`, `Lớp`, `Thiết bị`, `Thời gian`. Không bật "Bắt buộc".
3. Tab **Cài đặt** (Settings):
   - **Câu trả lời → Thu thập địa chỉ email**: chọn **Không thu thập**.
   - **Câu trả lời → Giới hạn 1 câu trả lời**: **tắt**.
   - Nếu dùng tài khoản Google của trường/công ty: tắt **Chỉ giới hạn ở người dùng trong …**. Nếu không tắt, lịch sử sẽ không ghi được.
4. Tab **Câu trả lời** → **Liên kết với Trang tính** → **Tạo** để có Google Trang tính chứa lịch sử.
5. Bấm **⋮** (góc trên bên phải) → **Lấy đường liên kết điền sẵn** (Get pre-filled link). Gõ chữ bất kỳ vào cả 4 ô, ví dụ `a`, `b`, `c`, `d` → **Lấy đường liên kết** → **Sao chép đường liên kết**.
6. Dán đường liên kết đó vào `js/config.js`, giữa hai dấu nháy của dòng `export const loginFormLink = '';`. Đổi số phiên bản trong `sw.js` (ví dụ `hvahm-v3` thành `hvahm-v4`) rồi đưa app lên lại.

> Lịch sử phát sinh trước khi dán link, hoặc khi máy mất mạng, được giữ lại trên máy và tự gửi bù khi có mạng và đã có link.

> Khi chưa kết nối Firebase, các chức năng cần nhiều máy cùng lúc (phòng chơi bằng mã PIN, giáo viên duyệt sản phẩm và xem thống kê của cả lớp) không dùng được và đã được ẩn đi.

---

## Chế độ nâng cao (không bắt buộc)

App có hai chế độ:

| Chế độ | Khi nào | Dữ liệu lưu ở đâu |
|---|---|---|
| **Chỉ cần link** | `js/config.js` để trống `apiKey` (mặc định) | Tiến độ lưu trên máy đang dùng, lịch sử đăng nhập gửi về Google Trang tính. |
| **Trực tuyến** | Đã dán cấu hình Firebase vào `js/config.js` | Trên Firebase. **Nhiều thiết bị** chơi cùng lúc, giáo viên xem thống kê từ bất kỳ máy nào. |

---

## 1. Chạy thử trên máy tính (Windows)

1. Mở PowerShell trong thư mục `app`.
2. Chạy:
   ```
   powershell -ExecutionPolicy Bypass -File tools\serve.ps1
   ```
3. Mở trình duyệt Chrome hoặc Edge, vào `http://localhost:8080`.
4. Bấm **Dành cho giáo viên → Vào trang giáo viên**, tạo lớp, rồi dùng mã lớp và mã học viên để đăng nhập ở vai học sinh.

> Muốn thử chế độ chơi cùng lớp: mở một tab làm giáo viên (**Mở phòng chơi trực tuyến**), mở tab khác vào **Vào phòng chơi cùng lớp** rồi nhập mã PIN.

---

## 2. Đưa app lên mạng để cả lớp chơi trên nhiều thiết bị

### Bước 1. Tạo dự án Firebase (miễn phí)
1. Vào <https://console.firebase.google.com>, đăng nhập tài khoản Google của giáo viên hoặc nhà trường.
2. **Add project / Thêm dự án** → đặt tên, ví dụ `hoc-vien-anh-hung-mang` → tắt Google Analytics (không cần) → **Create**.

### Bước 2. Bật đăng nhập
1. Menu **Build → Authentication → Get started**.
2. Tab **Sign-in method**, bật 2 mục:
   - **Anonymous** (Ẩn danh): để học sinh vào app mà không cần email.
   - **Email/Password**: cho giáo viên.

### Bước 3. Tạo cơ sở dữ liệu
1. Menu **Build → Firestore Database → Create database**.
2. Chọn vị trí gần Việt Nam, ví dụ `asia-southeast1 (Singapore)`.
3. Chọn **Start in production mode**.
4. Mở tab **Rules**, xóa nội dung cũ, dán toàn bộ nội dung tệp `firestore.rules`, rồi bấm **Publish**.

### Bước 4. Lấy cấu hình và dán vào app
1. Bấm ⚙️ **Project settings** → mục **Your apps** → bấm biểu tượng **Web `</>`** → đặt tên → **Register app**.
2. Firebase hiện ra đoạn `const firebaseConfig = { apiKey: "...", ... }`.
3. Mở tệp `js/config.js`, chép từng giá trị (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) vào đúng chỗ rồi lưu.
4. Mở tệp `sw.js`, đổi `hvahm-v1` thành `hvahm-v2` để các thiết bị tải bản mới.

> `apiKey` của Firebase Web không phải mật khẩu bí mật. Dữ liệu được bảo vệ bằng luật trong `firestore.rules`.

### Bước 5. Đưa app lên mạng (chọn một cách)

**Cách A – Netlify Drop (dễ nhất, không cần cài gì)**
1. Vào <https://app.netlify.com/drop>, đăng nhập.
2. Kéo thả **cả thư mục `app`** vào trang. Netlify sẽ cho một địa chỉ dạng `https://ten-ngau-nhien.netlify.app` (có thể đổi tên trong *Site settings*).
3. Quay lại Firebase: **Authentication → Settings → Authorized domains → Add domain**, thêm địa chỉ Netlify vừa có (không cần `https://`).

**Cách B – Firebase Hosting (cần cài Node.js)**
1. Cài Node.js từ <https://nodejs.org>, rồi chạy `npm install -g firebase-tools`.
2. Trong thư mục `app`, chạy `firebase login`, rồi `firebase use --add` (chọn dự án), rồi `firebase deploy`.
3. App sẽ chạy tại `https://<tên-dự-án>.web.app`. Tên miền này đã được Firebase cho phép sẵn.

### Bước 6. Tạo tài khoản giáo viên
Mở địa chỉ app → **Dành cho giáo viên** → nhập email, mật khẩu → **Tạo tài khoản giáo viên mới**.

---

## 3. Cài app lên thiết bị

| Thiết bị | Cách cài |
|---|---|
| **Android** (Chrome) | Mở địa chỉ app → bấm nút **📲 Cài app lên thiết bị** ở trang đầu, hoặc menu ⋮ → **Cài đặt ứng dụng / Thêm vào màn hình chính**. |
| **iPhone / iPad** (Safari) | Mở bằng **Safari** → nút **Chia sẻ ⬆️** → **Thêm vào MH chính** → **Thêm**. |
| **Laptop / máy tính** (Chrome, Edge) | Mở địa chỉ app → bấm biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc nút **📲 Cài app lên thiết bị**. |

Sau khi cài, app có biểu tượng 🛡️ riêng, mở toàn màn hình. Giao diện vẫn mở được khi mạng yếu, nhưng **chế độ trực tuyến cần Internet** để lưu kết quả và chơi cùng lớp.

---

## 4. Quy trình dùng trên lớp

1. **Trước khi bắt đầu:** in **Phiếu đồng ý phụ huynh** (trang giáo viên) và thu lại.
2. **Tạo lớp:** nhập tên lớp (không ghi tên trường), số học sinh, loại lớp (thực nghiệm hoặc đối chứng).
3. **Phát mã:** tab **Cài đặt → In phiếu mã**, cắt phát cho từng em. Phiếu chỉ có mã, không có tên.
4. **Buổi 1:** học sinh đăng nhập, chọn nhân vật, làm **Nhiệm vụ nhập học** (khảo sát trước).
5. **Các buổi tiếp theo:** mỗi buổi 1–2 thử thách. Có hai cách:
   - **Tự học:** mỗi em chơi trên thiết bị của mình. Giáo viên giới hạn tiến độ ở tab **Cài đặt → Mở đến thử thách…**
   - **Cả lớp cùng chơi:** **Mở phòng chơi trực tuyến** → chọn thử thách → chiếu mã PIN lên bảng → học sinh vào bằng mã PIN → giáo viên bấm từng bước, xem biểu đồ lựa chọn và cùng thảo luận. Có thể bật **thi theo đội**: app chỉ xếp hạng đội, không xếp hạng từng em.
6. **Sau thử thách 8:** học sinh làm **Kỳ thi tốt nghiệp** (khảo sát sau), nhận giấy chứng nhận (in được).
7. **Xưởng sáng tạo:** học sinh sáng tác tình huống và quy tắc. Giáo viên **duyệt** ở tab **Sản phẩm**, sau đó tình huống hiện trong **Thư viện của lớp** và quy tắc hiện trên **Lá chắn lớp** (in được).
8. **Phân tích:** tab **Thống kê** (trước – sau theo chủ đề, từng thử thách, lựa chọn sai phổ biến), trang **So sánh các lớp**, và nút **Xuất Excel (CSV)**.
9. **Kết thúc:** xuất dữ liệu, rồi **Cài đặt → Xóa dữ liệu học sinh**.

**Âm thanh:** app có nhạc nền hộp nhạc nhẹ nhàng, bắt đầu sau lần chạm đầu tiên (trình duyệt không cho tự phát nhạc trước đó). Nút **🎵** ở góc trên bật/tắt nhạc nền, nút **🔈** bật/tắt hiệu ứng âm thanh. Mỗi thiết bị nhớ lựa chọn riêng. Khi bấm nghe đọc 🔊, nhạc tự nhỏ lại. Khi cả lớp cùng chơi trên nhiều máy, giáo viên có thể dặn học sinh tắt 🎵 để lớp đỡ ồn.

**Lưu ý về thống kê:**
- Mỗi thử thách chỉ ghi nhận **lần chơi đầu tiên**. Các lần chơi lại chỉ để luyện tập và được đếm vào "số lượt".
- Kết quả trong **phòng chơi trực tuyến** chỉ dùng để thảo luận tại lớp, không gộp vào thống kê trước – sau.

---

## 5. Chỉnh sửa nội dung

Toàn bộ nội dung nằm trong `js/content.js`:
- `CHALLENGES`: 8 thử thách. Mỗi tình huống có `choices` với `level` (3 = An toàn, 2 = Gần an toàn, 1 = Cần luyện thêm), `result` (hệ quả), `explain` (giải thích), `hint` (gợi ý).
- `SURVEYS.pre` / `SURVEYS.post`: hai bộ khảo sát tương đương.
- `BAD_WORDS`: danh sách từ bị chặn trong Xưởng sáng tạo.

Sau khi sửa, đổi `VERSION` trong `sw.js` (ví dụ `hvahm-v3`) rồi đưa app lên mạng lại.

---

## 6. Cấu trúc thư mục

```
app/
├─ index.html              Trang chính
├─ manifest.webmanifest    Thông tin để cài app
├─ sw.js                   Lưu sẵn giao diện, chạy khi mạng yếu
├─ css/style.css           Giao diện
├─ icons/                  Biểu tượng app
├─ js/
│  ├─ config.js            Cấu hình Firebase (để trống = chạy thử)
│  ├─ content.js           Nội dung 8 thử thách, khảo sát
│  ├─ store.js             Lưu dữ liệu (chạy thử / Firebase)
│  ├─ player.js            Trình chơi thử thách
│  ├─ student.js           Màn hình học sinh
│  ├─ live.js              Phòng chơi trực tuyến
│  ├─ teacher.js           Trang giáo viên
│  ├─ ui.js, pwa.js, main.js
├─ firestore.rules         Luật bảo mật dữ liệu
├─ firebase.json           Cấu hình Firebase Hosting
└─ tools/                  serve.ps1 (chạy thử), make-icons.ps1
```

---

## 7. Muốn đưa lên CH Play / App Store?

Bản PWA đã cài được trên mọi thiết bị. Nếu nhà trường muốn có app trên cửa hàng, có thể dùng <https://www.pwabuilder.com> để đóng gói từ địa chỉ app đã đưa lên mạng. Việc này cần tài khoản nhà phát triển của Google (phí 25 USD một lần) hoặc Apple (99 USD mỗi năm), và phải tuân thủ chính sách cho ứng dụng dành cho trẻ em của từng cửa hàng.
