// Nội dung trò chơi: nhân vật, 8 thử thách, khảo sát trước/sau.
// {name} được thay bằng tên con vật học sinh chọn (ví dụ "Sóc Nâu").
// level: 3 = An toàn, 2 = Gần an toàn, 1 = Cần luyện thêm.

export const AVATARS = [
  { id: 'soc', name: 'Sóc Nâu', emoji: '🐿️' },
  { id: 'may', name: 'Mây Xanh', emoji: '☁️' },
  { id: 'gau', name: 'Gấu Trúc Tròn', emoji: '🐼' },
  { id: 'caheo', name: 'Cá Heo Nhỏ', emoji: '🐬' },
  { id: 'ho', name: 'Hổ Con', emoji: '🐯' },
  { id: 'chimse', name: 'Chim Sẻ', emoji: '🐦' },
  { id: 'ong', name: 'Ong Vàng', emoji: '🐝' },
  { id: 'tho', name: 'Thỏ Trắng', emoji: '🐰' },
  { id: 'rua', name: 'Rùa Xanh', emoji: '🐢' },
  { id: 'meo', name: 'Mèo Cam', emoji: '🐱' },
  { id: 'canhcut', name: 'Cánh Cụt', emoji: '🐧' },
  { id: 'khunglong', name: 'Khủng Long Xinh', emoji: '🦕' },
];
export const ADJECTIVES = ['Dũng Cảm', 'Thông Minh', 'Tốt Bụng', 'Nhanh Nhẹn', 'Vui Vẻ', 'Chăm Chỉ', 'Sáng Tạo', 'Tinh Mắt'];
export const COLORS = ['#FFB703', '#FB8500', '#8ECAE6', '#90BE6D', '#F28482', '#B497D6'];
export const TEAMS = [
  { id: 'do', name: 'Đội Đỏ', color: '#EF476F', emoji: '🔴' },
  { id: 'xanh', name: 'Đội Xanh', color: '#118AB2', emoji: '🔵' },
  { id: 'vang', name: 'Đội Vàng', color: '#FFD166', emoji: '🟡' },
  { id: 'luc', name: 'Đội Lục', color: '#06D6A0', emoji: '🟢' },
];
export const MENTOR = { name: 'Cú Thông Thái', emoji: '🦉' };

// Các khối hiển thị trong "điện thoại giả":
//  msg {from:'them'|'me', text}   profile {name, avatar, lines[]}   post {who, avatar, time, text, art, stats}
//  comment {who, avatar, text}    notif {icon, text}                web {url, title, text, fields[], button}
//  video {title, art, next, watched}   popup {title, text, art, button, timer}   photo {art, caption}   note {text}

export const CHALLENGES = [
  {
    id: 'c1', no: 1, title: 'Hồ sơ và thông tin cá nhân', room: 'Phòng Bí Mật', icon: '🔐', color: '#FF8FAB',
    badge: 'Người Giữ Bí Mật',
    intro: 'Hôm nay {name} nhận được một tin nhắn rất vui. Hãy xem chuyện gì xảy ra nhé!',
    screens: [
      {
        type: 'choice', app: 'Chat Nhí', contact: { name: 'Bạn Cáo Vui', avatar: '🦊', meta: 'Đang hoạt động' },
        blocks: [
          { b: 'msg', from: 'them', text: 'Chào {name}! Mình là Cáo Vui, quản lý nhóm “Quà Sinh Nhật Vui” 🎁' },
          { b: 'msg', from: 'them', text: 'Bạn vừa được chọn nhận hộp bút màu 48 cây đó!' },
          { b: 'msg', from: 'them', text: 'Bạn học trường nào để mình gửi quà về trường nha?' },
        ],
        ask: 'Chọn tin nhắn để trả lời:',
        hint: 'Cáo Vui là người em đã biết ngoài đời chưa?',
        choices: [
          { text: 'Mình học trường Tiểu học Hoa Sen nè!', level: 1, result: 'Cáo Vui đã biết trường của em. Người lạ có thể tìm đến trường để gặp em.' },
          { text: 'Mình chỉ nói tên lớp thôi nhé: lớp 5A.', level: 2, result: 'Tên lớp ghép với các thông tin khác có thể giúp người lạ tìm ra em.' },
          { text: 'Quà gì vậy? Gửi ảnh cho mình xem trước đi.', level: 2, result: 'Em chưa đưa thông tin, nhưng vẫn tiếp tục trò chuyện với người lạ.' },
          { text: 'Mình không cho thông tin đâu. Mình sẽ hỏi bố mẹ.', level: 3, result: 'Tuyệt vời! Em giữ bí mật và nhờ người lớn giúp.' },
        ],
        explain: 'Người lạ hứa tặng quà rồi hỏi thông tin là dấu hiệu đáng ngờ. Tên trường là thông tin cần giữ bí mật.',
      },
      {
        type: 'choice', app: 'Chat Nhí', contact: { name: 'Bạn Cáo Vui', avatar: '🦊', meta: 'Đang hoạt động' },
        blocks: [
          { b: 'msg', from: 'them', text: 'Thôi khỏi cần trường. Cho mình địa chỉ nhà và số điện thoại của mẹ nha 😊' },
          { b: 'msg', from: 'them', text: 'Nhanh lên nhé, quà chỉ giữ đến 8 giờ tối nay thôi!' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Cáo Vui đang hỏi thêm thông tin và còn thúc giục em nữa.',
        choices: [
          { text: 'Gửi địa chỉ nhà để nhận quà cho kịp', level: 1, result: 'Người lạ đã biết nhà em ở đâu. Điều này rất nguy hiểm.' },
          { text: 'Chỉ gửi số điện thoại của mình thôi', level: 1, result: 'Người lạ có thể gọi điện, nhắn tin làm phiền hoặc lừa em.' },
          { text: 'Không trả lời nữa, nhưng không kể với ai', level: 2, result: 'Em đã không cho thông tin, nhưng người lớn chưa biết để giúp em chặn tài khoản này.' },
          { text: 'Chặn Cáo Vui và kể cho bố mẹ nghe', level: 3, result: 'Chính xác! Chặn và kể cho người lớn là cách an toàn nhất.' },
        ],
        explain: 'Người lạ hỏi thông tin từng chút một và thúc giục “nhanh lên”. Em chặn tài khoản và kể cho người lớn nhé.',
      },
      {
        type: 'sort', app: 'Trò chơi', title: 'Xếp thông tin vào đúng giỏ',
        baskets: ['✅ Chia sẻ được', '🔒 Giữ bí mật'],
        items: [
          { text: 'Con vật em thích', answer: 0 },
          { text: 'Tên trường của em', answer: 1 },
          { text: 'Địa chỉ nhà', answer: 1 },
          { text: 'Món ăn em thích', answer: 0 },
          { text: 'Số điện thoại của bố mẹ', answer: 1 },
          { text: 'Mật khẩu game', answer: 1 },
          { text: 'Bài hát em thích', answer: 0 },
          { text: 'Ảnh em mặc đồng phục có logo trường', answer: 1 },
        ],
        explain: 'Sở thích thì chia sẻ được. Thông tin giúp người khác tìm ra em (trường, nhà, số điện thoại, mật khẩu) thì phải giữ bí mật.',
      },
    ],
    signs: ['Người lạ hứa tặng quà', 'Hỏi thông tin từng chút một', 'Thúc giục: “Nhanh lên!”'],
    rules: [
      'Em không cho người lạ biết tên trường, địa chỉ, số điện thoại.',
      'Khi ai đó hứa tặng quà và hỏi thông tin, em hỏi bố mẹ trước.',
      'Em có thể chặn người lạ và kể cho người lớn.',
    ],
  },
  {
    id: 'c2', no: 2, title: 'Người lạ kết bạn', room: 'Phòng Kết Bạn', icon: '🤝', color: '#8ECAE6',
    badge: 'Thám Tử Tài Khoản',
    intro: '{name} vừa mở mạng xã hội Kết Nối Vui. Có thông báo mới đang chờ em!',
    screens: [
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'notif', icon: '👋', text: 'Bé Na 2015 đã gửi lời mời kết bạn' },
          { b: 'profile', name: 'Bé Na 2015', avatar: '👤', lines: ['📅 Tham gia: 2 ngày trước', '👥 Bạn chung: 0', '🖼️ Chưa có ảnh nào', '✏️ “Học lớp 5, thích chơi game”'] },
          { b: 'msg', from: 'them', text: 'Mình cũng lớp 5 nè, kết bạn đi! 😊' },
        ],
        ask: 'Em bấm nút nào?',
        hint: 'Hãy nhìn kỹ ngày tham gia và số bạn chung nhé!',
        choices: [
          { text: '✅ Chấp nhận, bạn ấy cũng lớp 5 mà', level: 1, result: 'Người lạ giờ có thể xem ảnh, bài đăng và nhắn tin cho em.' },
          { text: '✅ Chấp nhận nhưng không nhắn tin', level: 1, result: 'Khi đã là bạn, người lạ vẫn xem được ảnh và bài đăng của em.' },
          { text: '💬 Hỏi lại: “Bạn tên thật là gì, học trường nào?”', level: 2, result: 'Hỏi lại vẫn là trò chuyện với người lạ, và người ấy có thể nói dối.' },
          { text: '🚫 Xóa lời mời và chặn tài khoản', level: 3, result: 'Chính xác! Em không kết bạn với người mình không biết ngoài đời.' },
        ],
        explain: 'Tài khoản mới tạo, không có ảnh, không có bạn chung là tài khoản đáng ngờ. Ai cũng có thể nói “mình lớp 5”.',
      },
      {
        type: 'choice', app: 'Chat Nhí', contact: { name: 'Na Na ⭐', avatar: '👤', meta: 'Người lạ · 0 bạn chung' },
        blocks: [
          { b: 'note', text: 'Vài hôm sau, một tài khoản khác nhắn tin cho em:' },
          { b: 'msg', from: 'them', text: 'Hi {name}! Mình là bạn của Bé Na nè' },
          { b: 'msg', from: 'them', text: 'Tối nay mình chơi game cùng nha, mình cho bạn bộ đồ xịn' },
          { b: 'msg', from: 'them', text: 'Mà đừng kể với bố mẹ nha, bí mật của tụi mình thôi 🤫' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Vì sao người ấy muốn em giữ bí mật với bố mẹ?',
        choices: [
          { text: 'Đồng ý, nghe vui quá!', level: 1, result: 'Em đang làm theo lời người lạ và giấu bố mẹ. Đây là lúc nguy hiểm nhất.' },
          { text: 'Ừ, mình sẽ giữ bí mật', level: 1, result: 'Người lạ muốn em giữ bí mật để người lớn không thể bảo vệ em.' },
          { text: 'Từ chối, nhưng không kể với ai', level: 2, result: 'Em đã từ chối, nhưng người lạ có thể tiếp tục nhắn tin cho em và các bạn khác.' },
          { text: 'Không trả lời, chặn và kể cho bố mẹ ngay', level: 3, result: 'Rất dũng cảm! Kể cho bố mẹ giúp em và cả các bạn khác an toàn.' },
        ],
        explain: 'Người lạ dặn “đừng kể với bố mẹ” là dấu hiệu nguy hiểm nhất. Bí mật với người lạ luôn cần kể cho người lớn tin cậy.',
      },
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'note', text: 'Có 3 lời mời kết bạn mới:' },
          { b: 'profile', name: 'Minh Anh', avatar: '👧', lines: ['📅 Tham gia: 2 năm trước', '👥 Bạn chung: 12 (các bạn lớp 5A)', '🖼️ Có ảnh lớp đi dã ngoại'] },
          { b: 'profile', name: 'Gamer Pro 2014', avatar: '🎮', lines: ['📅 Tham gia: hôm qua', '👥 Bạn chung: 0', '📨 Đã gửi lời mời cho 300 người'] },
          { b: 'profile', name: 'Anh họ Tuấn', avatar: '🧑', lines: ['📅 Tham gia: 5 năm trước', '👥 Bạn chung: 8 (có cả bố mẹ em)'] },
        ],
        ask: 'Em sẽ chặn tài khoản nào?',
        hint: 'Tài khoản nào mới tạo và không có bạn chung nào?',
        choices: [
          { text: 'Minh Anh', level: 1, result: 'Minh Anh có nhiều bạn chung cùng lớp, có ảnh lớp. Em nên hỏi lại các bạn để chắc chắn.' },
          { text: 'Gamer Pro 2014', level: 3, result: 'Đúng rồi! Mới tạo hôm qua, 0 bạn chung, gửi lời mời cho 300 người: rất đáng ngờ.' },
          { text: 'Anh họ Tuấn', level: 1, result: 'Anh Tuấn có bạn chung là bố mẹ em. Em có thể hỏi bố mẹ để chắc chắn.' },
        ],
        explain: 'Khi không chắc, em hỏi bố mẹ: “Bố mẹ có biết người này không?”',
      },
    ],
    signs: ['Tài khoản mới tạo, không có ảnh', 'Không có bạn chung', 'Dặn “đừng kể với bố mẹ”', 'Hứa cho quà, đồ xịn, kim cương'],
    rules: [
      'Em chỉ kết bạn với người em biết ngoài đời thật.',
      'Ai bảo em giữ bí mật với bố mẹ, em kể ngay cho bố mẹ.',
      'Em biết dùng nút Chặn và Báo cáo.',
    ],
  },
  {
    id: 'c3', no: 3, title: 'Bình luận ác ý', room: 'Phòng Tử Tế', icon: '💬', color: '#FFD166',
    badge: 'Trái Tim Tử Tế',
    intro: 'Bạn Thỏ Hồng vừa đăng một bức tranh lên Kết Nối Vui. Mọi người đang bình luận…',
    screens: [
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'post', who: 'Thỏ Hồng', avatar: '🐰', time: '10 phút trước', text: 'Tranh mình vẽ cho cuộc thi của trường nè! 🌈', art: '🌈🏡🌳☀️' },
          { b: 'comment', who: 'Quạ Đen', avatar: '🐦‍⬛', text: 'Vẽ gì xấu như gà bới 😂' },
          { b: 'comment', who: 'Ẩn danh 1', avatar: '❔', text: 'Haha đúng rồi, thôi đừng thi nữa' },
          { b: 'comment', who: 'Ẩn danh 2', avatar: '❔', text: '😂😂😂' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Nếu em là Thỏ Hồng, em sẽ cảm thấy thế nào?',
        choices: [
          { text: '😂 Thả “haha” cho vui, ai cũng thả mà', level: 1, result: 'Thêm một lượt “haha” làm Thỏ Hồng buồn hơn. Em đã vô tình hùa theo.' },
          { text: '😡 Bình luận: “Quạ Đen mới xấu, đồ đáng ghét!”', level: 1, result: 'Đáp trả bằng lời ác ý làm cuộc cãi nhau to hơn.' },
          { text: '🙈 Lặng lẽ lướt qua', level: 2, result: 'Em không hùa theo, nhưng Thỏ Hồng vẫn một mình buồn bã.' },
          { text: '💖 Khen tranh của Thỏ Hồng và báo cáo bình luận xấu', level: 3, result: 'Tuyệt vời! Lời khen của em giúp Thỏ Hồng thấy có bạn bên cạnh.' },
        ],
        explain: 'Không hùa theo, không đáp trả bằng lời ác ý. Em có thể động viên bạn và bấm “Báo cáo” bình luận xấu.',
      },
      {
        type: 'choice', app: 'Chat Nhí', contact: { name: 'Thỏ Hồng', avatar: '🐰', meta: 'Bạn cùng lớp' },
        blocks: [
          { b: 'msg', from: 'them', text: 'Mình buồn quá… chắc mình không dám vẽ nữa 😢' },
        ],
        ask: 'Chọn tin nhắn để trả lời bạn:',
        hint: 'Thỏ Hồng đang cần được động viên.',
        choices: [
          { text: 'Kệ đi, ai bảo đăng lên làm gì', level: 1, result: 'Thỏ Hồng càng buồn hơn vì nghĩ mình có lỗi.' },
          { text: 'Ừ, tranh cũng hơi xấu thật', level: 1, result: 'Lời nói thật lòng nhưng thiếu tử tế làm bạn tổn thương.' },
          { text: 'Bạn xóa bài đi là xong', level: 2, result: 'Xóa bài có thể giúp bạn bớt buồn, nhưng người lớn vẫn chưa biết để giúp.' },
          { text: 'Đừng buồn, tranh bạn đẹp mà! Mình cùng kể cô giáo nhé', level: 3, result: 'Thỏ Hồng mỉm cười rồi! Em vừa là một người bạn tốt.' },
        ],
        explain: 'Động viên bạn và cùng bạn kể với người lớn là cách giúp bạn tốt nhất.',
      },
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'note', text: 'Nếu mình là Thỏ Hồng… Một ngày, ảnh của {name} bị bình luận:' },
          { b: 'post', who: '{name}', avatar: '{avatar}', time: 'Hôm qua', text: 'Ảnh mình đi chơi công viên 🎡', art: '🎡🌸🙂' },
          { b: 'comment', who: 'Tài khoản lạ', avatar: '❔', text: 'Trông buồn cười quá 😂 đăng làm gì' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Có ai có thể giúp em không?',
        choices: [
          { text: 'Bình luận chửi lại thật to', level: 1, result: 'Cãi nhau làm em thêm mệt và buồn.' },
          { text: 'Tạo tài khoản khác để chê lại người đó', level: 1, result: 'Em đã biến mình thành người bắt nạt người khác.' },
          { text: 'Buồn và giữ trong lòng, không nói với ai', level: 2, result: 'Em không làm gì sai, nhưng em không nên buồn một mình.' },
          { text: 'Chụp màn hình, báo cáo và kể với bố mẹ hoặc thầy cô', level: 3, result: 'Chính xác! Người lớn sẽ giúp em xử lý.' },
        ],
        explain: 'Bị chế giễu không phải lỗi của em. Hãy chụp màn hình làm bằng chứng, báo cáo và kể với người lớn.',
      },
    ],
    signs: ['Lời lẽ chê bai, chế giễu', 'Nhiều người hùa theo', 'Bạn bị chê buồn, muốn bỏ cuộc'],
    rules: [
      'Em không hùa theo và không đáp trả bằng lời ác ý.',
      'Em động viên bạn bị chế giễu.',
      'Bị bắt nạt trên mạng, em chụp màn hình, báo cáo và kể với người lớn.',
    ],
  },
  {
    id: 'c4', no: 4, title: 'Lừa đảo “trúng thưởng”', room: 'Phòng Kim Cương', icon: '💎', color: '#B497D6',
    badge: 'Mắt Thần Soi Lừa Đảo',
    intro: '{name} đang chơi game Đảo Kim Cương thì có một thông báo hiện lên…',
    screens: [
      {
        type: 'choice', app: 'Đảo Kim Cương',
        blocks: [
          { b: 'popup', title: '🎉 CHÚC MỪNG {NAME}!', art: '💎💎💎', text: 'Bạn nhận 10.000 kim cương miễn phí! Bấm link: dao-kim-cuong-qua-tang.vip', button: 'NHẬN NGAY', timer: 'Chỉ còn 04:59' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Quà to như vậy mà miễn phí, lại còn đếm ngược… có đáng ngờ không?',
        choices: [
          { text: 'Bấm “NHẬN NGAY” thật nhanh kẻo hết giờ', level: 1, result: 'Em đã vào một trang web lừa đảo.' },
          { text: 'Bấm vào xem thử, không nhập gì', level: 2, result: 'Bấm vào link lạ đã có thể gặp nguy hiểm, dù em không nhập gì.' },
          { text: 'Gửi link cho các bạn cùng nhận', level: 1, result: 'Em vô tình giúp kẻ lừa đảo lừa thêm các bạn của mình.' },
          { text: 'Đóng thông báo, không bấm link', level: 3, result: 'Đúng rồi! Quà “miễn phí” kèm link lạ thường là bẫy.' },
        ],
        explain: 'Quà quá hấp dẫn, đồng hồ đếm ngược, link lạ là ba dấu hiệu lừa đảo.',
      },
      {
        type: 'choice', app: 'Trình duyệt',
        blocks: [
          { b: 'note', text: 'Giả sử em đã lỡ bấm vào link. Trang web hiện ra:' },
          { b: 'web', url: 'dao-kim-cuong-qua-tang.vip', title: 'Nhận 10.000 💎', text: 'Mã OTP đã được gửi về điện thoại của mẹ bạn. Nhập mã để nhận quà!', fields: ['Tên đăng nhập', 'Mật khẩu', 'Mã OTP'], button: 'Nhận quà' },
        ],
        ask: 'Em làm gì tiếp?',
        hint: 'Mật khẩu và mã OTP có nên cho ai không?',
        choices: [
          { text: 'Nhập tên đăng nhập và mật khẩu', level: 1, result: 'Kẻ gian đã lấy được tài khoản game của em.' },
          { text: 'Mượn điện thoại mẹ để lấy mã OTP nhập vào', level: 1, result: 'Mã OTP có thể giúp kẻ gian lấy tiền trong tài khoản của mẹ.' },
          { text: 'Chỉ nhập tên đăng nhập thôi', level: 2, result: 'Tên đăng nhập cũng giúp kẻ gian dễ dò mật khẩu của em hơn.' },
          { text: 'Không nhập gì, đóng trang và kể cho bố mẹ', level: 3, result: 'Rất tốt! Bố mẹ sẽ giúp em đổi mật khẩu nếu cần.' },
        ],
        explain: 'Mật khẩu và mã OTP không bao giờ được cho ai, kể cả người tự xưng là nhà game.',
      },
      {
        type: 'sort', app: 'Soi Link', title: 'Soi link: trang chính thức của game là daokimcuong.vn',
        baskets: ['✅ Link thật', '❌ Link giả'],
        items: [
          { text: 'daokimcuong.vn', answer: 0 },
          { text: 'dao-kim-cuong-qua-tang.vip', answer: 1 },
          { text: 'daokimcu0ng.vn (số 0 thay chữ o)', answer: 1 },
          { text: 'daokimcuong.vn.nhanqua.xyz', answer: 1 },
          { text: 'daokimcuong.vn/tin-tuc', answer: 0 },
        ],
        explain: 'Link giả thường thêm chữ lạ, đổi một chữ cái, hoặc có đuôi lạ như .vip, .xyz.',
      },
    ],
    signs: ['Quà quá hấp dẫn, miễn phí', 'Đồng hồ đếm ngược thúc giục', 'Link lạ, sai chính tả', 'Đòi mật khẩu, mã OTP'],
    rules: [
      'Em không bấm vào link lạ, dù quà hấp dẫn.',
      'Mật khẩu và mã OTP không bao giờ cho ai.',
      'Lỡ bấm link lạ, em đóng lại và báo bố mẹ ngay.',
    ],
  },
  {
    id: 'c5', no: 5, title: 'Tin giả, giật gân', room: 'Phòng Sự Thật', icon: '📰', color: '#90BE6D',
    badge: 'Nhà Kiểm Chứng Tài Ba',
    intro: 'Nhóm lớp 5A đang xôn xao vì một bài đăng. Hãy cùng {name} xem nhé!',
    screens: [
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'note', text: 'Nhóm Lớp 5A: bạn Gấu đã chia sẻ bài này' },
          { b: 'post', who: 'Tin Nóng 24h', avatar: '📢', time: '1 giờ trước', text: 'CẢNH BÁO KHẨN!!! Ngày mai TẤT CẢ trường học đóng cửa vì bão lớn!!! Chia sẻ ngay cho mọi người!!!', art: '🌪️⛈️', stats: '2.300 lượt chia sẻ' },
        ],
        ask: 'Em sẽ làm gì với bài đăng này?',
        hint: 'Trang “Tin Nóng 24h” có phải trang của nhà trường không?',
        choices: [
          { text: 'Chia sẻ ngay cho cả nhóm lớp', level: 1, result: 'Nhiều bạn tin tin giả và nghỉ học. Ngày mai trường vẫn học bình thường!' },
          { text: 'Tin luôn và không chuẩn bị sách vở nữa', level: 1, result: 'Hôm sau em đi học mà quên sách vở vì tin vào tin giả.' },
          { text: 'Bình luận hỏi: “Thật không mọi người?”', level: 2, result: 'Hỏi là tốt, nhưng các bạn trên mạng có thể cũng không biết.' },
          { text: 'Không chia sẻ, hỏi bố mẹ hoặc xem thông báo của trường', level: 3, result: 'Chuẩn! Em đã Dừng lại – Kiểm tra – Hỏi người lớn.' },
        ],
        explain: 'Viết hoa, nhiều dấu chấm than, thúc giục chia sẻ là dấu hiệu tin giật gân. Hãy kiểm tra nguồn chính thức.',
      },
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'post', who: 'Tin Nóng 24h', avatar: '📢', time: '1 giờ trước', text: 'SỐC!!! Trường học đóng cửa ngày mai!!!', art: '😱' },
          { b: 'post', who: 'Trường Tiểu học Hoa Sen ✔️', avatar: '🏫', time: '30 phút trước', text: 'Thông báo: Ngày mai học sinh đi học bình thường. Nhà trường sẽ báo nếu có thay đổi.', art: '📋' },
        ],
        ask: 'Em tin bài đăng nào hơn?',
        hint: 'Bài nào có dấu ✔️ và đến từ chính nhà trường?',
        choices: [
          { text: 'Bài của Tin Nóng 24h vì nhiều người chia sẻ', level: 1, result: 'Nhiều người chia sẻ không có nghĩa là tin đúng.' },
          { text: 'Cả hai đều đúng', level: 1, result: 'Hai bài nói ngược nhau, nên không thể cùng đúng.' },
          { text: 'Bài của trang chính thức của nhà trường', level: 3, result: 'Đúng rồi! Thông báo chính thức từ nhà trường là nguồn đáng tin.' },
          { text: 'Chưa chắc, em hỏi thầy cô cho chắc chắn', level: 3, result: 'Rất tốt! Hỏi thầy cô luôn là cách kiểm tra chắc chắn.' },
        ],
        explain: 'Hãy tin nguồn chính thức (nhà trường, cơ quan nhà nước) và hỏi người lớn khi chưa chắc.',
      },
      {
        type: 'sort', app: 'Trò chơi', title: 'Xếp các dấu hiệu vào đúng giỏ',
        baskets: ['🚩 Dấu hiệu tin giả', '👍 Dấu hiệu tin đáng tin'],
        items: [
          { text: 'Viết hoa toàn bộ, nhiều dấu !!!', answer: 0 },
          { text: 'Có nguồn rõ ràng, trang chính thức', answer: 1 },
          { text: 'Thúc giục “Chia sẻ ngay!”', answer: 0 },
          { text: 'Ảnh mờ, không rõ chụp ở đâu', answer: 0 },
          { text: 'Nhà trường và báo chí cùng thông báo', answer: 1 },
          { text: 'Tiêu đề “SỐC”, “KHẨN”', answer: 0 },
        ],
        explain: 'Trước khi chia sẻ: Dừng lại – Kiểm tra nguồn – Hỏi người lớn.',
      },
    ],
    signs: ['Tiêu đề giật gân, viết hoa, nhiều dấu !', 'Không có nguồn rõ ràng', 'Thúc giục chia sẻ ngay'],
    rules: [
      'Trước khi chia sẻ, em Dừng lại – Kiểm tra – Hỏi người lớn.',
      'Em tin thông báo từ nguồn chính thức như nhà trường.',
      'Em không chia sẻ tin làm mọi người hoang mang.',
    ],
  },
  {
    id: 'c6', no: 6, title: 'Cơ chế gây nghiện', room: 'Phòng Đồng Hồ', icon: '⏰', color: '#F28482',
    badge: 'Chủ Nhân Thời Gian',
    intro: '{name} mở MeoTube định xem đúng 1 video thôi…',
    screens: [
      {
        type: 'choice', app: 'MeoTube',
        blocks: [
          { b: 'notif', icon: '🔔', text: 'Bạn có 5 video mới!' },
          { b: 'video', title: 'Mèo con nhảy múa 😹 (tập 7)', art: '😹🎶', next: 'Video tiếp theo sau 3… 2… 1…', watched: 'Em đã xem: 1 giờ 20 phút' },
        ],
        ask: 'Em làm gì?',
        hint: 'Em định xem mấy video? Bây giờ đã là bao lâu rồi?',
        choices: [
          { text: 'Xem tiếp, video tự chạy mà', level: 1, result: 'Thêm 1 tiếng nữa trôi qua mà em không hề hay biết.' },
          { text: 'Bấm vào 5 video mới', level: 1, result: 'Thông báo đã “kéo” em ở lại lâu hơn.' },
          { text: 'Xem thêm 1 video nữa rồi thôi', level: 2, result: '“Một video nữa” thường thành nhiều video. Em cần dừng hẳn.' },
          { text: 'Tắt tự động phát và dừng xem', level: 3, result: 'Giỏi quá! Em đã làm chủ thời gian của mình.' },
        ],
        explain: 'Video tự chạy tiếp và thông báo liên tục là “mánh” để giữ em xem mãi. Hãy tắt chúng đi.',
      },
      {
        type: 'choice', app: 'MeoTube',
        blocks: [
          { b: 'notif', icon: '👩', text: 'Mẹ: {name} ơi, xuống ăn cơm nào!' },
          { b: 'popup', title: '🎁 Quà mỗi ngày!', art: '🧰✨', text: 'Xem thêm 10 phút để mở rương báu. Bỏ lỡ hôm nay là mất chuỗi 7 ngày!', button: 'Xem tiếp' },
        ],
        ask: 'Em làm gì?',
        hint: 'Rương báu quan trọng hơn bữa cơm với gia đình không?',
        choices: [
          { text: 'Xem thêm 10 phút để mở rương', level: 1, result: 'Mẹ phải gọi thêm 3 lần, cơm đã nguội mất rồi.' },
          { text: 'Nói “Con xuống liền!” nhưng vẫn xem tiếp', level: 1, result: 'Em đã để ứng dụng quyết định thay em.' },
          { text: 'Mang máy xuống vừa ăn vừa xem', level: 2, result: 'Vừa ăn vừa xem làm em không trò chuyện được với gia đình.' },
          { text: 'Tắt máy, xuống ăn cơm', level: 3, result: 'Tuyệt vời! Mất chuỗi cũng không sao, gia đình quan trọng hơn.' },
        ],
        explain: '“Quà mỗi ngày”, “chuỗi ngày” là mánh để em quay lại liên tục. Em có quyền bỏ qua.',
      },
      {
        type: 'sort', app: 'Trò chơi', title: 'Gọi tên các “mánh giữ chân”',
        baskets: ['🪝 Mánh giữ chân', '🙂 Tính năng giúp em'],
        items: [
          { text: 'Video tự động phát tiếp', answer: 0 },
          { text: 'Thông báo liên tục', answer: 0 },
          { text: 'Hẹn giờ nghỉ', answer: 1 },
          { text: 'Quà mỗi ngày nếu quay lại', answer: 0 },
          { text: 'Nút tắt thông báo', answer: 1 },
          { text: 'Chuỗi ngày: bỏ một ngày là mất hết', answer: 0 },
        ],
        explain: 'Ứng dụng dùng mánh để giữ chân em. Hẹn giờ và tắt thông báo giúp em làm chủ thời gian.',
      },
      {
        type: 'plan', app: 'Sổ tay', title: 'Kế hoạch dùng thiết bị của em',
        minutes: [30, 45, 60],
        activities: ['⚽ Chơi thể thao', '📚 Đọc truyện', '🎨 Vẽ tranh', '🧩 Chơi cùng bạn bè', '🍳 Giúp bố mẹ việc nhà', '🎵 Học nhạc'],
        explain: 'Em đã có kế hoạch của riêng mình. Hãy dán kế hoạch này lên góc học tập nhé!',
      },
    ],
    signs: ['Video tự phát tiếp', 'Thông báo dồn dập', 'Phần thưởng ép quay lại mỗi ngày'],
    rules: [
      'Em tắt tự động phát và thông báo.',
      'Em đặt hẹn giờ khi xem video.',
      'Khi được gọi, em dừng lại ngay.',
    ],
  },
  {
    id: 'c7', no: 7, title: 'Hình ảnh và quyền riêng tư', room: 'Phòng Ảnh', icon: '📸', color: '#FFB703',
    badge: 'Người Bảo Vệ Hình Ảnh',
    intro: 'Bạn Mèo Mướp vừa gửi cho {name} một bức ảnh…',
    screens: [
      {
        type: 'choice', app: 'Chat Nhí', contact: { name: 'Mèo Mướp', avatar: '🐈', meta: 'Bạn cùng lớp' },
        blocks: [
          { b: 'msg', from: 'them', text: '{name} ơi xem nè 😆' },
          { b: 'photo', art: '😴📚', caption: 'Ảnh Gấu Trúc ngủ gật trong lớp' },
          { b: 'msg', from: 'them', text: 'Đăng lên nhóm lớp cho cả lớp cười nha? Bạn đăng giúp mình đi!' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Gấu Trúc đã đồng ý cho đăng ảnh chưa?',
        choices: [
          { text: 'Đăng luôn, vui mà!', level: 1, result: 'Gấu Trúc rất xấu hổ khi cả lớp cười ảnh của mình.' },
          { text: 'Không đăng nhóm, chỉ gửi riêng cho vài bạn', level: 1, result: 'Ảnh vẫn bị lan đi khắp nơi, vì các bạn có thể gửi tiếp.' },
          { text: 'Bảo Mèo Mướp tự đăng, mình không liên quan', level: 2, result: 'Em không đăng, nhưng chưa ngăn được bạn làm điều không tốt.' },
          { text: 'Không đăng, khuyên Mèo Mướp xóa ảnh vì chưa hỏi Gấu Trúc', level: 3, result: 'Đúng rồi! Em vừa bảo vệ bạn Gấu Trúc.' },
        ],
        explain: 'Muốn đăng ảnh có người khác, phải xin phép người đó trước. Không đăng ảnh làm bạn xấu hổ.',
      },
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'note', text: 'Em thấy ảnh của chính mình bị đăng khi chưa đồng ý:' },
          { b: 'post', who: 'Ẩn danh 5A', avatar: '❔', time: '5 phút trước', text: 'Nhìn mặt {name} nè 🤣', art: '🤪📸' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Có những ai có thể giúp em gỡ ảnh xuống?',
        choices: [
          { text: 'Đăng ảnh xấu của bạn khác để trả đũa', level: 1, result: 'Thêm một người bạn bị tổn thương, mọi chuyện rối hơn.' },
          { text: 'Bình luận chửi người đăng', level: 1, result: 'Cãi nhau làm nhiều người chú ý đến bức ảnh hơn.' },
          { text: 'Buồn nhưng không nói với ai', level: 2, result: 'Em không có lỗi, nhưng em xứng đáng được giúp đỡ.' },
          { text: 'Nhờ người đăng gỡ ảnh, báo cáo và kể với người lớn', level: 3, result: 'Rất đúng! Ảnh đã được gỡ nhờ em lên tiếng.' },
        ],
        explain: 'Em có quyền với hình ảnh của mình. Hãy nhờ gỡ ảnh, báo cáo bài đăng và kể với người lớn.',
      },
      {
        type: 'choice', app: 'Kết Nối Vui',
        blocks: [
          { b: 'note', text: 'Em muốn đăng ảnh cả nhóm đi dã ngoại:' },
          { b: 'photo', art: '🧒👧🧒🌳⛺', caption: 'Ảnh nhóm 5 bạn ở khu cắm trại' },
        ],
        ask: 'Em đăng thế nào?',
        hint: 'Trong ảnh có những ai? Các bạn ấy đã biết chưa?',
        choices: [
          { text: 'Đăng luôn, ảnh đẹp mà', level: 2, result: 'Có bạn trong ảnh không muốn ảnh của mình lên mạng.' },
          { text: 'Đăng kèm tên trường và địa chỉ khu cắm trại', level: 1, result: 'Ảnh đã làm lộ thông tin cá nhân của cả nhóm.' },
          { text: 'Hỏi các bạn trong ảnh có đồng ý không rồi mới đăng', level: 3, result: 'Tuyệt! Mọi người đều vui vì được hỏi ý kiến.' },
          { text: 'Chỉ đăng khi bạn nào không đồng ý đã được che mặt', level: 3, result: 'Rất chu đáo! Em tôn trọng mong muốn của từng bạn.' },
        ],
        explain: 'Trước khi đăng ảnh có người khác: hỏi ý kiến, không kèm thông tin cá nhân.',
      },
    ],
    signs: ['Ảnh có thể làm người khác xấu hổ', 'Chưa xin phép người trong ảnh', 'Ảnh làm lộ thông tin cá nhân'],
    rules: [
      'Em xin phép trước khi đăng ảnh có người khác.',
      'Em không đăng ảnh làm bạn xấu hổ.',
      'Bị đăng ảnh khi chưa đồng ý, em nhờ gỡ, báo cáo và kể với người lớn.',
    ],
  },
  {
    id: 'c8', no: 8, title: 'Hội chợ An toàn số', room: 'Hội Chợ Tổng Kết', icon: '🎪', color: '#06D6A0',
    badge: 'Anh Hùng Mạng',
    intro: 'Chào mừng {name} đến Hội chợ An toàn số! Hãy đi qua 5 gian hàng thử thách.',
    screens: [
      {
        type: 'choice', station: '🕵️ Gian Thám tử Hồ sơ', app: 'Chat Nhí', contact: { name: 'Shop Quà Tặng 🎁', avatar: '🎁', meta: 'Người lạ' },
        blocks: [
          { b: 'msg', from: 'them', text: 'Bạn đã trúng thưởng một chiếc xe đạp! 🚲' },
          { b: 'msg', from: 'them', text: 'Bấm link qua-tang-free.xyz rồi điền địa chỉ nhà để nhận nhé!' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Ở đây có mấy dấu hiệu đáng ngờ?',
        choices: [
          { text: 'Bấm link và điền địa chỉ nhà', level: 1, result: 'Kẻ gian vừa có link lừa đảo, vừa có địa chỉ nhà em.' },
          { text: 'Bấm link xem thử thôi', level: 2, result: 'Bấm link lạ đã là nguy hiểm.' },
          { text: 'Gửi cho bạn bè xem có ai trúng không', level: 1, result: 'Em đã vô tình lan truyền lừa đảo.' },
          { text: 'Không bấm, chặn và báo bố mẹ', level: 3, result: 'Hoàn hảo! Em nhận ra cả người lạ, link lạ và việc hỏi địa chỉ.' },
        ],
        explain: 'Người lạ + trúng thưởng + link lạ + hỏi địa chỉ = lừa đảo.',
      },
      {
        type: 'choice', station: '💖 Gian Lá chắn Tử tế', app: 'Chat Nhí', contact: { name: 'Nhóm “Hội Bạn Thân”', avatar: '👥', meta: '6 thành viên' },
        blocks: [
          { b: 'msg', from: 'them', text: 'Bạn mới lớp mình nói giọng buồn cười ghê 😂' },
          { b: 'msg', from: 'them', text: 'Lập nhóm chê bạn ấy đi, {name} vào không?' },
        ],
        ask: 'Em trả lời thế nào?',
        hint: 'Bạn mới sẽ cảm thấy thế nào nếu biết chuyện này?',
        choices: [
          { text: 'Vào nhóm cho vui', level: 1, result: 'Em đã tham gia bắt nạt một bạn mới.' },
          { text: 'Ở lại nhóm nhưng im lặng', level: 2, result: 'Im lặng làm các bạn nghĩ em đồng ý.' },
          { text: 'Rời nhóm và lập nhóm khác chê lại các bạn kia', level: 1, result: 'Đáp trả bằng bắt nạt không giải quyết được gì.' },
          { text: 'Nói “Đừng chê bạn ấy” và kể với cô giáo', level: 3, result: 'Em là một Lá chắn Tử tế thực thụ!' },
        ],
        explain: 'Không tham gia, lên tiếng bảo vệ bạn và báo người lớn.',
      },
      {
        type: 'choice', station: '🔍 Gian Soi Link', app: 'Hộp thư',
        blocks: [
          { b: 'web', url: 'Thư từ: daokimcuong-hotro@mail.xyz', title: '⚠️ Tài khoản sẽ bị khóa!', text: 'Tài khoản Đảo Kim Cương của bạn sẽ bị khóa trong 1 giờ. Đăng nhập tại daokimcu0ng.vn để giữ tài khoản.', fields: [], button: 'Đăng nhập ngay' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Nhìn kỹ link: “daokimcu0ng” có gì lạ?',
        choices: [
          { text: 'Đăng nhập ngay kẻo bị khóa', level: 1, result: 'Link có số 0 thay chữ o: đây là trang giả để lấy mật khẩu.' },
          { text: 'Gửi mật khẩu để họ kiểm tra giúp', level: 1, result: 'Không ai được biết mật khẩu của em.' },
          { text: 'Trả lời thư hỏi lại có thật không', level: 2, result: 'Kẻ gian sẽ trả lời rằng “thật” để lừa em tiếp.' },
          { text: 'Không bấm, báo bố mẹ, tự mở game chính thức để kiểm tra', level: 3, result: 'Xuất sắc! Em kiểm tra ở nguồn chính thức.' },
        ],
        explain: 'Thư dọa “bị khóa” để em hoảng sợ mà bấm vào. Luôn kiểm tra link thật kỹ.',
      },
      {
        type: 'choice', station: '📰 Gian Kiểm chứng Tin', app: 'MeoTube',
        blocks: [
          { b: 'video', title: 'Uống nước chanh muối khỏi cúm ngay trong 1 giờ!!! Chia sẻ để cứu người thân!', art: '🍋🧂', next: '15.000 lượt chia sẻ', watched: 'Kênh: Mẹo Hay Mỗi Ngày' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Ai là người hiểu rõ nhất về bệnh và thuốc?',
        choices: [
          { text: 'Chia sẻ ngay cho gia đình', level: 1, result: 'Người thân có thể bỏ uống thuốc vì tin vào mẹo sai.' },
          { text: 'Bảo bà uống thử xem sao', level: 1, result: 'Mẹo chưa kiểm chứng có thể làm bệnh nặng hơn.' },
          { text: 'Bấm thích nhưng không chia sẻ', level: 2, result: 'Lượt thích giúp video lan rộng hơn.' },
          { text: 'Không chia sẻ, hỏi bố mẹ hoặc bác sĩ', level: 3, result: 'Đúng vậy! Tin về sức khỏe cần hỏi người có chuyên môn.' },
        ],
        explain: 'Tin về sức khỏe đặc biệt cần kiểm chứng với bác sĩ hoặc nguồn chính thức.',
      },
      {
        type: 'choice', station: '⏰ Gian Làm chủ Thời gian', app: 'Đảo Kim Cương',
        blocks: [
          { b: 'note', text: 'Đã 9 giờ tối, mai em phải đi học.' },
          { b: 'popup', title: '🔥 Chuỗi 30 ngày!', art: '🏆', text: 'Chơi thêm 1 tiếng để giữ chuỗi 30 ngày và nhận rương huyền thoại!', button: 'Chơi tiếp' },
        ],
        ask: 'Em sẽ làm gì?',
        hint: 'Giấc ngủ quan trọng thế nào với ngày mai của em?',
        choices: [
          { text: 'Chơi tiếp 1 tiếng', level: 1, result: 'Sáng mai em buồn ngủ và mệt mỏi trong lớp.' },
          { text: 'Chơi lén trong chăn', level: 1, result: 'Chơi lén làm em mất ngủ và mất lòng tin của bố mẹ.' },
          { text: 'Chơi thêm 15 phút thôi', level: 2, result: 'Đã muộn rồi, 15 phút dễ thành 1 tiếng.' },
          { text: 'Dừng lại đi ngủ, mất chuỗi cũng không sao', level: 3, result: 'Tuyệt vời! Em đúng là Chủ nhân Thời gian.' },
        ],
        explain: 'Chuỗi ngày và rương báu là mánh giữ chân. Sức khỏe của em quan trọng hơn.',
      },
    ],
    signs: ['Kết hợp nhiều dấu hiệu cùng lúc', 'Luôn dừng lại suy nghĩ', 'Luôn có người lớn để hỏi'],
    rules: [
      'Gặp điều lạ trên mạng, em Dừng lại – Suy nghĩ – Hỏi người lớn.',
      'Em bảo vệ bản thân và cả các bạn của em.',
      'Em là Anh hùng Mạng: an toàn, tử tế, tỉnh táo.',
    ],
  },
];

export const TOPICS = ['Thông tin cá nhân', 'Người lạ', 'Bình luận ác ý', 'Lừa đảo', 'Tin giả', 'Gây nghiện', 'Hình ảnh', 'Tổng hợp'];

// Bộ A (trước) và bộ B (sau): độ khó tương đương, khác các tình huống trong game.
export const SURVEYS = {
  pre: {
    title: 'Nhiệm vụ nhập học', intro: 'Trước khi vào Học viện, Cú Thông Thái muốn biết {name} sẽ làm gì trong 8 tình huống. Không có đúng hay sai, em cứ chọn như em thường làm nhé!',
    items: [
      { t: 0, art: '💌', text: 'Một người lạ nhắn: “Cho mình xin địa chỉ nhà để gửi thiệp sinh nhật nhé!”', choices: [['Gửi địa chỉ nhà', 1], ['Chỉ gửi tên đường thôi', 2], ['Không gửi, kể với bố mẹ', 3]] },
      { t: 1, art: '👤', text: 'Một tài khoản lạ, không có bạn chung, mời em kết bạn và khen em dễ thương.', choices: [['Chấp nhận kết bạn', 1], ['Nhắn hỏi bạn là ai', 2], ['Xóa lời mời, kể với bố mẹ', 3]] },
      { t: 2, art: '💬', text: 'Bạn em bị chê “mập” dưới ảnh đăng.', choices: [['Thả “haha”', 1], ['Bỏ qua', 2], ['Động viên bạn, báo cáo bình luận', 3]] },
      { t: 3, art: '📱', text: 'Tin nhắn: “Bạn trúng điện thoại mới! Gửi mã OTP để nhận quà.”', choices: [['Gửi mã OTP', 1], ['Nhắn hỏi lại có thật không', 2], ['Không trả lời, báo bố mẹ', 3]] },
      { t: 4, art: '📢', text: 'Bài đăng: “KHẨN!!! Ăn kem sẽ bị bệnh lạ, chia sẻ ngay!!!”', choices: [['Chia sẻ ngay', 1], ['Bỏ qua, không làm gì', 2], ['Không chia sẻ, hỏi người lớn', 3]] },
      { t: 5, art: '📺', text: 'Em đã xem video 1 tiếng, video tiếp theo đang tự chạy.', choices: [['Xem tiếp', 1], ['Xem thêm 1 video', 2], ['Tắt và làm việc khác', 3]] },
      { t: 6, art: '📸', text: 'Bạn muốn em đăng ảnh một bạn khác đang khóc lên nhóm lớp.', choices: [['Đăng lên', 1], ['Không đăng, nhưng cười cùng bạn', 2], ['Từ chối, khuyên bạn không đăng', 3]] },
      { t: 7, art: '🎮', text: 'Người lạ trong game: “Cho mình mật khẩu, mình chơi giúp lên cấp. Đừng nói bố mẹ nhé!”', choices: [['Cho mật khẩu', 1], ['Cho rồi đổi mật khẩu sau', 2], ['Không cho, kể với bố mẹ', 3]] },
    ],
  },
  post: {
    title: 'Kỳ thi tốt nghiệp', intro: 'Sắp tốt nghiệp rồi! Hãy cho Cú Thông Thái xem {name} sẽ làm gì trong 8 tình huống cuối cùng.',
    items: [
      { t: 0, art: '📝', text: 'Một trang web lạ hỏi tên trường và số điện thoại để “tham gia khảo sát nhận quà”.', choices: [['Điền đầy đủ', 1], ['Chỉ điền tên trường', 2], ['Đóng trang, hỏi bố mẹ', 3]] },
      { t: 1, art: '🧑', text: 'Người lạ trong game xưng “anh lớp 7”, rủ em lập nhóm chat riêng.', choices: [['Đồng ý ngay', 1], ['Hỏi anh ấy học trường nào', 2], ['Từ chối, kể với bố mẹ', 3]] },
      { t: 2, art: '😢', text: 'Cả nhóm lớp đang gửi ảnh chế về một bạn.', choices: [['Gửi thêm ảnh chế', 1], ['Đọc nhưng không nói gì', 2], ['Nói “dừng lại”, báo thầy cô', 3]] },
      { t: 3, art: '🎁', text: 'Quảng cáo: “Bấm vào đây nhận 1 triệu đồng! Chỉ còn 2 phút!”', choices: [['Bấm ngay', 1], ['Bấm xem thử', 2], ['Không bấm, đóng lại', 3]] },
      { t: 4, art: '🐉', text: 'Video: “Phát hiện rồng thật ở Việt Nam!!! Chia sẻ trước khi bị xóa!”', choices: [['Chia sẻ ngay', 1], ['Tin luôn', 1], ['Kiểm tra nguồn, hỏi người lớn', 3]] },
      { t: 5, art: '🔔', text: 'Game báo: “Vào chơi mỗi ngày để không mất quà!” lúc em đang làm bài tập.', choices: [['Vào chơi ngay', 1], ['Chơi một chút rồi làm bài', 2], ['Tắt thông báo, làm bài tiếp', 3]] },
      { t: 6, art: '🖼️', text: 'Em chụp được ảnh vui của cả lớp và muốn đăng lên mạng.', choices: [['Đăng luôn', 2], ['Đăng kèm tên trường, lớp', 1], ['Hỏi ý kiến các bạn trước', 3]] },
      { t: 7, art: '🕵️', text: 'Tài khoản lạ nhắn: “Mình có bí mật về bạn. Gửi ảnh của bạn thì mình mới nói.”', choices: [['Gửi ảnh', 1], ['Nhắn hỏi bí mật gì', 2], ['Không trả lời, chặn, kể bố mẹ', 3]] },
    ],
  },
  self: [
    'Em tự tin nhận ra tin nhắn lừa đảo.',
    'Em biết thông tin nào cần giữ bí mật.',
    'Em biết làm gì khi bị bình luận ác ý.',
    'Em biết cách làm chủ thời gian dùng thiết bị.',
  ],
  scale: [['😟', 'Chưa tự tin'], ['😐', 'Hơi tự tin'], ['🙂', 'Tự tin'], ['😄', 'Rất tự tin']],
};

// Bộ lọc từ ngữ đơn giản cho phần sáng tác (giáo viên vẫn duyệt lần cuối).
export const BAD_WORDS = ['ngu', 'đần', 'khốn', 'chết đi', 'đồ chó', 'mày', 'tao', 'cút', 'đánh chết', 'xấu xí', 'béo ú', 'đm', 'vcl', 'vl'];
