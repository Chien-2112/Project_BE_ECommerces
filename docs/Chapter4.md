## CHAPTER 4: TÌM HIỂU VỀ APIKEY.

# API TOKEN.
+. API Token được sử dụng để server xác thực và phân quyền cho người dùng khi truy cập vào hệ thống. Nó được generate khi gọi người dùng signin, signup vào hệ thống.

# API KEY.
+. API key dùng để xác định ứng dụng nào gọi tới. Trường hợp BE được gọi bởi nhiều services(Client web/app, Seller web, Admin web, another BE,...) thì api key sẽ xác định lời gọi này của service nào, từ đó quản lý và hạn chế traffic / transmission.

=> Nghĩa là chúng ta sẽ tự tạo với những điều khoản của từng service muốn hợp tác.

_VD:_ Một doanh nghiệp muốn sử dụng service này thì bên cung cấp sẽ tạo ra 1 APIKEY chứa thông tin gói mua của DN đó. VD DN mua gói limit 30K request mỗi tháng thì họ sẽ tính lượng requests thông qua APIKEY.