# TMDT-FashionWebsite
# 🛍️ TMDT Fashion Website

## 📌 Giới thiệu

Website thương mại điện tử bán thời trang, cho phép người dùng:

* Xem sản phẩm
* Tìm kiếm, lọc sản phẩm
* Thêm vào giỏ hàng
* Đặt hàng và thanh toán
* ...

Admin có thể:

* Quản lý sản phẩm, danh mục
* Quản lý đơn hàng
* Xem báo cáo
* ...

---

## 🛠️ Công nghệ sử dụng

### Backend

* Java + Spring Boot
* Spring MVC
* Spring Data JPA
* Spring Security

### Frontend

* HTML, CSS, JavaScript
* Bootstrap
* Thymeleaf

### Database

* MySQL (XAMPP)

### Khác

* Chart.js (dashboard)
* Google Maps API
* Postman

---

## 🚀 Cách chạy project

### 1. Clone project

```bash
git clone <link-repo>
cd <ten-project>
```

### 2. Cấu hình database


Cập nhật file:

```
src/main/resources/application.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fashionshop
spring.datasource.username=root
spring.datasource.password=""
```

---

### 3. Run project

* Mở bằng IntelliJ
* Run file: `FashionShopApplication`

---

### 4. Truy cập

```
http://localhost:8080
```

---

## 📂 Cấu trúc project

```
enum/          -> Lưu trữ trạng thái người dùng, đơn hàng
exception/     -> Xử lý exception
controller/    -> Xử lý request
service/       -> Business logic
repository/    -> Làm việc với database
entity/        -> Model dữ liệu
dto/           -> Data transfer object
config/        -> Cấu hình
security/      -> Bảo mật

templates/     → HTML (Thymeleaf)
static/        → CSS, JS, images
```

---

## 👥 Quy tắc làm việc nhóm

* Không push trực tiếp lên `main`
* Code trên branch `feature/...` sau đó merge vào `develop`
    + git checkout feature/...
* Pull code mới nhất trước khi code:
`
git pull
`

---

## 📌 Thành viên

...
1. Backend Developer
- Khởi tạo cấu trúc project
- Build github
- Code backend User, Admin page
2. Frontend Developer
- Code frontend User, Admin page
3. Business + Requirements
- Giới thiệu chung hệ thống
- Chức năng cụ thể từng actor (customer, admin)
- Yêu cầu phi chức năng
4. UML - 1 (liên kết với backend)
- Vẽ Use Case Diagrams
- Vẽ Class Diagrams
5. UML - 2 (mô tả luồng chạy tổng thể của web)
- Vẽ Sequence Diagrams
- Vẽ Activity Diagrams
6. Tester
- Test từng chức năng, giao diện
- Dùng excel/word/ggsheet ghi lại test, vd:
      + Sai logic
      + UI lỗi
      + ....
7. Documentation + support
- Hỗ trợ các phần khác khi cần
- Tổng hợp báo cáo web
8. Support frontend
- Hỗ trợ frontend tìm ảnh, nd sản phẩm (tên, giá, mô tả…)
- Đề xuất màu sắc, bố cục web


---

