## CHAPTER 3: CONNECT MONGODB.

=> 7 điều cần triển khai.

# 1. Nhược điểm của cách Connect cũ.

# 2. Cách connect mới, khuyên dùng.

# 3. Kiểm tra số connect trong hệ thống ?

# 4. Thông báo khi server quá tải connect.

# 5. Có nên disConnect() liên tục như Java, PHP hay không ?
=> Việc này còn tùy thuộc vào kịch bản sử dụng và yêu cầu của ứng dụng:

  __5.1 NÊN DISCONNECT KHI NÀO ?__
- Nếu ứng dụng chỉ chạy trong một khoảng thời gian ngắn, như một script hoặc job, thì nên disConnect MongoDb sau khi hoàn thành xử lý để giải pháp tài nguyên.

  __5.2 KHÔNG CẦN DISCONNECT KHI NÀO ?__
- Trong các ứng dụng web server, MongooDB thường giữ 1 kết nối dài hạn để tối ưu hiệu năng. Khi server nhận request, nó sử dụng kết nối này thay vì tạo lại kết nối mới.

- Trong trường hợp này, không nên liên tục connect và disConnect vì sẽ gây overhead.

Mongoose sử dụng pool(1 nhóm kết nối để quản lý DB) và nó tự động xử lý việc mở & đóng kết nối khi cần.

__=> KẾT LUẬN:__
+. Ứng dụng ngắn hạn: Disconnect sau khi hoàn tất công việc.
+. Ứng dụng dài hạn: Duy trì kết nối, chỉ disconnect khi server tắt.


# 6. PoolSize là gì ? Vì sao lại quan trọng ?
+. poolSize(hay maxPoolSize) là 1 tham số dùng để chỉ định số lượng kết nối tối đa mà conenction pool có thể duy trì tới MongoDB.

__Connection Pool__
+. Là một nhóm các kết nối tới MongoDB được giữ sẵn trong bộ nhớ và sẵn sàng sử dụng.
+. Khi ứng dụng gửi truy vấn tới MongoDB, nó sẽ lấy một kết nối từ pool thay vì tạo mới một kết nối. Sau khi hoàn thành, kết nối được trả về pool để tái sử dụng.

+. Việc sử dụng pool giúp tối ưu hóa hiệu năng:
  - Giảm thời gian tạo kết nối mới.
  - Tăng khả năng xử lý đồng thời cho nhiều truy vấn.

# 7. Nếu vượt quá kết nối PoolSize ??
+. Khi số lượng kết nối đồng thời vượt quá giới hạn poolSize, sẽ gặp một số tình huống sau:
__1. Cơ chế hoạt động__
+. Các request mới sẽ bị đưa vào queue(hàng đợi) cho đến khi một kết nối trong pool được giải phóng.
=> Làm tăng thời gian phản hồi(latency) của ứng dụng.

+. Và nếu request đó chờ quá lâu và không thể lấy được kết nối từ pool(vì tất cả kết nối vẫn bận) thì một lỗi timeout sẽ xảy ra.
=> Mặc định, thời gian chờ tối đa (socketTimeoutMS hoặc serverSelectionTimeoutMS) thường được cấu hình là vài giây.

__2. Lỗi thường gặp khi vượt poolSize__
+. Khi kết nối không thể được thiết lập trong thời gian chờ
=> Gặp lỗi: MongoTimeoutError

+. Khi số lượng request lớn nhưng không đủ kết nối để xử lý, hiệu năng của hệ thống sẽ bị giảm sút đáng kể.

__3. Cách xử lý khi vượt quá poolSize__

__A. Tăng giá trị poolSize__
+. Nếu server MongoDB có đủ tài nguyên (CPU, RAM), bạn có thể tăng giới hạn poolSize để hỗ trợ thêm kết nối.

__B. Tối ưu hóa truy vấn__
+. Đảm bảo mỗi kết nối được giải phóng nhanh chóng.

+. Tránh giữ kết nối quá lâu, hạn chế các truy vấn dài hoặc phức tạp
(vd: sử dụng projection để chỉ lấy DL cần thiết, hoặc index hóa các trường được truy vấn).

+. Batch Query: Nếu có nhiều truy vấn nhỏ, hãy gộp chúng thành một truy vấn lớn để giảm số lượng kết nối.

__C. Cân bằng tải(Load Balancing)__
+. Sử dụng nhiều instance của MongoDB để phân tán kết nối.
+. Sử dụng cơ chế replica set hoặc sharding của MongoDB để tăng khả năng mở rộng.