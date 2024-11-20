## CHAPTER 2: NODEJS 19 RELEASE.

+. Với những lập trình viên làm Back-end sử dụng Nodejs làm core thì những động thái phát hành version mới của NodeJS sẽ được quan tâm và tôi cũng không ngoại lệ.

+. NodeJS gần đây đã công bố phát hành phiên bản 19. Phiên bản này có các tính năng sau:
  -  node --watch
  - KeepAlive theo mặc định.
  - WebCrypto ổn định.
  - Cập nhật V8 lên V10.1

=> Trong bài viết này, cùng khám phá những điểm nổi bật chính của phiên bản này. 

# XÁC MINH PHIÊN BẢN NODEJS.
=> Để xác minh phiên bản NodeJS:
     node --version   or   node -v

# TÍNH NĂNG 1 - NODE --WATCH.
+. Tính năng Watch Mode, cho phép chạy ứng dụng NodeJS ở chế độ đồng hồ, sẽ tự động khởi động lại quy trình khi mã nguồn thay đổi.
=> Tính năng này chỉ hoạt động với NodeJS v19.0.0 và v18.11.0+

__CÁCH SỬ DỤNG:__
+. Chạy server với cờ --watch: Cờ này sẽ kích hoạt chế độ theo dõi tệp.
     node --watch file_name

=> NodeJS sẽ tự động phát hiện các thay đổi trong tệp JS hoặc TS trong project, và tự động khởi động lại server mà không cần install thư viện nodemon.

+. Nếu muốn tích hợp các flag --watch trong tệp package.json, có thể cấu hình như sau: 
{
	"scripts": {
	  "start:dev": "node --watch server.js"
	}
}
=> Sau đó chạy:  npm run start:dev.