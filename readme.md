Với quy mô công ty vừa, mình nghĩ bạn nên thiết kế hệ thống này theo hướng **Company Resource Management System (CRMS)** – một nền tảng quản lý, lưu trữ, chia sẻ và kiểm soát quyền truy cập tài nguyên nội bộ của công ty.

Đây không đơn thuần là một website upload/download file. Nếu thiết kế đúng, nó sẽ giống một hệ thống quản lý tài nguyên tập trung, nơi nhân viên có thể tìm kiếm tài liệu, chia sẻ dữ liệu, làm việc theo phòng ban và quản lý quyền truy cập.

Mình sẽ lên kế hoạch theo hướng một sản phẩm có thể triển khai thực tế, có khả năng mở rộng về sau.

# **I. Xác định phạm vi hệ thống**

## **1. Những loại tài nguyên cần quản lý**

Trước tiên, cần xác định hệ thống sẽ lưu trữ những gì.

**1. Tài liệu (Documents)**

- PDF, DOCX, XLSX, PPTX
- Tài liệu hướng dẫn nội bộ
- Hợp đồng, báo cáo, biểu mẫu
- Tài liệu dự án

**2. Media**

- Hình ảnh, video
- Âm thanh
- Thiết kế đồ họa
- Logo, banner, bộ nhận diện thương hiệu

**3. Tài nguyên kỹ thuật**

- Source code, thư viện
- File cấu hình
- Tài liệu API
- File backup, dữ liệu kỹ thuật

**4. Tài nguyên dùng chung**

- Liên kết website
- Tài khoản/tài nguyên dùng chung (chỉ lưu thông tin được phép, không lưu mật khẩu dạng văn bản)
- Bộ template
- Tài nguyên theo dự án và phòng ban

**Đề xuất:** Ban đầu tập trung vào quản lý file, tài liệu, hình ảnh và video. Các loại tài nguyên khác có thể bổ sung sau.

## **2. Đối tượng sử dụng**

Hệ thống nên hỗ trợ:

- Quản trị viên hệ thống (System Admin).
- Quản lý công ty (Company Manager).
- Quản lý phòng ban (Department Manager).
- Nhân viên (Employee).
- Người dùng bên ngoài được cấp quyền (External User).

Không nên mặc định mọi nhân viên đều nhìn thấy tất cả tài nguyên.

# **II. Các phân hệ chức năng chính**

Mình đề xuất chia hệ thống thành 12 phân hệ.

**01. Authentication & Account**

Bắt buộc

Quản lý đăng nhập, tài khoản, xác thực và phiên làm việc.

- Đăng nhập / đăng xuất.
- Quên mật khẩu / đặt lại mật khẩu.
- Xác minh email.
- Đổi mật khẩu.
- Quản lý phiên đăng nhập.
- Đăng xuất khỏi các thiết bị khác.
- 2FA / MFA.
- Khóa tài khoản khi có dấu hiệu bất thường.

**02. User & Organization Management**

Bắt buộc

Quản lý nhân viên và cấu trúc công ty.

- Tạo / sửa / khóa tài khoản.
- Quản lý thông tin nhân viên.
- Phòng ban (Department).
- Chức vụ (Position).
- Nhóm làm việc (Team).
- Mời nhân viên tham gia hệ thống.
- Nhân viên nghỉ việc / thu hồi quyền.

**03. Role & Permission Management**

Bắt buộc

Phân quyền và kiểm soát truy cập.

- Role-Based Access Control (RBAC).
- Quyền theo chức năng.
- Quyền theo tài nguyên.
- Quyền theo phòng ban.
- Quyền theo dự án.
- Chia sẻ quyền riêng lẻ.
- Thu hồi quyền.

**04. File & Resource Management**

Bắt buộc

Phân hệ trung tâm của toàn bộ hệ thống.

- Upload / Download.
- Tạo thư mục / thư mục con.
- Di chuyển / sao chép.
- Đổi tên / xóa.
- Xem trước tài liệu.
- Phân loại tài nguyên.
- Gắn tag / metadata.
- Đánh dấu yêu thích.
- Quản lý dung lượng.

**05. Folder & Workspace Management**

- Không gian lưu trữ công ty.
- Không gian theo phòng ban.
- Không gian theo dự án.
- Không gian cá nhân.
- Thư mục dùng chung.
- Quyền kế thừa từ thư mục cha.

**06. Sharing & Collaboration**

- Chia sẻ tài nguyên cho nhân viên.
- Chia sẻ cho nhóm / phòng ban.
- Chia sẻ bằng liên kết.
- Liên kết có thời hạn.
- Mật khẩu cho liên kết chia sẻ.
- Giới hạn lượt tải.
- Thu hồi liên kết.
- Bình luận / ghi chú tài nguyên.

**07. Search & Discovery**

- Tìm kiếm theo tên.
- Tìm kiếm theo loại file.
- Tìm kiếm theo người upload.
- Tìm kiếm theo phòng ban.
- Tìm kiếm theo tag.
- Lọc theo ngày tạo / dung lượng.
- Tìm kiếm nội dung tài liệu (Full-text Search).

**08. Version Control**

- Lưu nhiều phiên bản file.
- Upload phiên bản mới.
- Xem lịch sử thay đổi.
- Khôi phục phiên bản cũ.
- So sánh phiên bản nếu định dạng hỗ trợ.

**09. Activity & Audit Log**

- Ai upload tài nguyên?
- Ai xem / tải tài nguyên?
- Ai sửa / xóa?
- Ai chia sẻ?
- Ai thay đổi quyền?
- Lịch sử đăng nhập.
- Lịch sử hoạt động của quản trị viên.

**10. Notification System**

- Thông báo khi được chia sẻ file.
- Thông báo khi có phiên bản mới.
- Thông báo khi quyền truy cập thay đổi.
- Thông báo dung lượng gần đầy.
- Thông báo tài nguyên sắp hết hạn.
- Email / thông báo trong hệ thống.

**11. Dashboard & Statistics**

- Tổng số tài nguyên.
- Tổng dung lượng sử dụng.
- Dung lượng theo phòng ban.
- Người dùng hoạt động.
- Tài nguyên được truy cập nhiều.
- Lịch sử upload/download.
- Thống kê theo thời gian.

**12. System Administration**

- Cấu hình hệ thống.
- Giới hạn dung lượng.
- Quản lý loại file cho phép.
- Cấu hình lưu trữ.
- Backup / Restore.
- Quản lý chính sách bảo mật.
- Quản lý tích hợp bên thứ ba.

# **III. Thiết kế hệ thống phân quyền**

Đây là một trong những phần quan trọng nhất. Nếu thiết kế sai từ đầu, sau này thêm phòng ban, dự án hoặc quyền chia sẻ sẽ rất khó sửa.

## **1. Không nên chỉ dùng Role đơn giản**

Ví dụ đơn giản:

```
Admin
Manager
Employee
```

Cách này chưa đủ.

Vì một nhân viên có thể:

- Được xem tài liệu phòng ban A.
- Được chỉnh sửa tài liệu dự án B.
- Không được xem tài liệu phòng ban C.
- Có quyền quản lý một thư mục riêng.

Do đó, nên kết hợp nhiều lớp phân quyền.

## **2. Mô hình RBAC + Resource Permission**

Mình đề xuất:

- RBAC: Quyền theo vai trò.
- Department Scope: Quyền theo phòng ban.
- Resource ACL: Quyền riêng trên từng tài nguyên.
- Project Scope: Quyền theo dự án.

Ví dụ cấu trúc:

**User / Employee**

**Role**

Vai trò

**Membership**

Phòng ban / dự án

**Permission Evaluation**

Kiểm tra quyền truy cập

**Resource Access**

Cho phép hoặc từ chối hành động

## **3. Các quyền cần có**

| Nhóm quyền | Các quyền                            |
| ---------- | ------------------------------------ |
| File       | View, Upload, Download, Edit, Delete |
| Folder     | Create, Rename, Move, Delete         |
| Sharing    | Share, Revoke, Manage                |
| Version    | View, Upload, Restore                |
| Admin      | Manage Users, Roles, Settings        |
| Audit      | View Logs, Export Logs               |

Cần lưu ý: `View`, `Download` và `Share` phải là các quyền độc lập. Người dùng được xem trước không có nghĩa là được tải xuống hoặc chia sẻ.

## **4. Ví dụ phân quyền thực tế**

| Vai trò            | Phạm vi            | Quyền                          |
| ------------------ | ------------------ | ------------------------------ |
| System Admin       | Toàn hệ thống      | Quản trị                       |
| Company Manager    | Toàn công ty       | Xem và quản lý theo chính sách |
| Department Manager | Phòng ban          | Quản lý tài nguyên phòng ban   |
| Employee           | Được cấp quyền     | Xem, tải, upload               |
| Project Member     | Dự án              | Theo quyền dự án               |
| External User      | Tài nguyên chia sẻ | Quyền giới hạn                 |

Một số nguyên tắc quan trọng:

- Mặc định từ chối nếu không có quyền.
- Không cho nhân viên tự nâng quyền.
- Quyền trên thư mục có thể kế thừa xuống thư mục con.
- Quyền riêng trên tài nguyên cần có cơ chế xử lý khi xung đột.
- Khi nhân viên nghỉ việc phải thu hồi quyền và xử lý tài nguyên họ sở hữu.

# **IV. Thiết kế xác thực và bảo mật**

Phân quyền và xác thực là hai vấn đề khác nhau:

- **Authentication:** Người dùng là ai?
- **Authorization:** Người dùng được phép làm gì?

## **1. Authentication – Xác thực**

Mình đề xuất thiết kế các chức năng sau:

| Chức năng                  | Mức độ         |
| -------------------------- | -------------- |
| Email + Password           | Bắt buộc       |
| Email Verification         | Bắt buộc       |
| Forgot / Reset Password    | Bắt buộc       |
| Session Management         | Bắt buộc       |
| JWT Access + Refresh Token | Tùy kiến trúc  |
| 2FA / MFA                  | Nên có         |
| Google / Microsoft SSO     | Có thể mở rộng |
| Login History              | Nên có         |
| Device Management          | Nên có         |
| Account Lockout            | Nên có         |

Đối với công ty, mình đặc biệt khuyến nghị hỗ trợ SSO (Single Sign-On) trong tương lai. Nhân viên có thể đăng nhập bằng tài khoản Google Workspace hoặc Microsoft Entra ID của công ty.

## **2. Authorization – Kiểm tra quyền**

Mỗi request cần trải qua quy trình kiểm tra:

**Client gửi Request**

**Authentication Middleware**

Kiểm tra danh tính / phiên đăng nhập

**Authorization Middleware**

Kiểm tra Role / Permission / Scope

**Resource Ownership & Access Check**

Kiểm tra quyền đối với tài nguyên cụ thể

**Allow**

**Deny**

Một số vấn đề bảo mật cần xử lý:

- Không tin tưởng `userId`, `role`, `departmentId` do client gửi lên.
- Không chỉ ẩn nút Download ở frontend mà phải kiểm tra quyền ở backend.
- Không để lộ đường dẫn lưu trữ thực tế.
- Không sử dụng URL file công khai cho tài liệu riêng tư.
- Kiểm tra quyền mỗi lần tải file, kể cả khi có URL chia sẻ.
- Chống IDOR/BOLA (truy cập tài nguyên của người khác bằng cách thay ID).
- Chống CSRF, XSS, SQL Injection.
- Rate Limiting cho đăng nhập và các API nhạy cảm.

# **V. Thiết kế hệ thống lưu trữ file**

Đây là phần quyết định khả năng hoạt động lâu dài của hệ thống.

## **1. Không nên lưu file trực tiếp vào Database**

Một sai lầm phổ biến là lưu file dưới dạng BLOB trong MySQL/PostgreSQL.

Mình khuyến nghị tách biệt:

**Frontend**

Upload / Download / Preview

**Backend API (Node.js)**

Authentication / Authorization / Metadata

**SQL Database**

Tên file, người upload, quyền, phiên bản, dung lượng, metadata

**Object Storage**

File thực tế: PDF, ảnh, video, tài liệu...

Các lựa chọn lưu trữ:
**Lưa trữ nội bộ**
Admin chọn thư mục lưa tại webserver hoặc máy chủ chạy web 
**Google Driver** 
Lưa trữ Google Driver
**Cloudflare R2**

Object storage tương thích S3, phù hợp nếu muốn lưu trữ trên cloud.


## **2. Các chức năng lưu trữ cần thiết**

| Chức năng           | Mô tả                           |
| ------------------- | ------------------------------- |
| Multipart Upload    | Upload file lớn theo từng phần  |
| Resumable Upload    | Tiếp tục upload khi mất kết nối |
| Streaming           | Đọc/tải file theo luồng         |
| Checksum            | Kiểm tra tính toàn vẹn          |
| Deduplication       | Phát hiện file trùng lặp        |
| Thumbnail           | Tạo ảnh xem trước               |
| File Preview        | Xem trước file                  |
| File Versioning     | Quản lý phiên bản               |
| Trash / Recycle Bin | Khôi phục file đã xóa           |
| Retention Policy    | Chính sách lưu trữ              |
| Storage Quota       | Giới hạn dung lượng             |

Một số giới hạn cần thiết:

- Dung lượng tối đa cho một file.
- Tổng dung lượng của mỗi nhân viên.
- Tổng dung lượng mỗi phòng ban.
- Các định dạng file được phép.
- Số lượng file upload đồng thời.
- Giới hạn tốc độ tải xuống nếu cần.

## **3. Quy trình upload file**

Ví dụ khi nhân viên upload một tài liệu:

1. Client gửi yêu cầu upload.
2. Backend xác thực người dùng.
3. Kiểm tra quyền upload vào thư mục.
4. Kiểm tra dung lượng và loại file.
5. Tạo bản ghi upload hoặc cấp quyền upload tạm thời.
6. Upload file lên Object Storage.
7. Kiểm tra checksum, kích thước và kết quả upload.
8. Quét malware trước khi đưa file vào sử dụng.
9. Lưu metadata vào Database.
10. Ghi Audit Log.
11. Thông báo kết quả cho Client.

Lưu ý: Với file nhạy cảm, nên có trạng thái `PENDING_SCAN`, `ACTIVE`, `QUARANTINED`, `FAILED`. Không nên cho người dùng khác truy cập file trước khi hoàn tất kiểm tra.

# **VI. Thiết kế Database**

Mình đề xuất sử dụng mô hình quan hệ SQL để quản lý các quan hệ giữa nhân viên, phòng ban, quyền, thư mục và tài nguyên.

Các nhóm bảng chính:

## **1. User & Organization**

| Bảng               | Mục đích                  |
| ------------------ | ------------------------- |
| users              | Thông tin tài khoản       |
| user_profiles      | Thông tin nhân viên       |
| departments        | Phòng ban                 |
| positions          | Chức vụ                   |
| teams              | Nhóm làm việc             |
| department_members | Nhân viên thuộc phòng ban |
| invitations        | Lời mời tham gia          |

## **2. Authentication & Authorization**

| Bảng             | Mục đích                  |
| ---------------- | ------------------------- |
| roles            | Vai trò                   |
| permissions      | Danh sách quyền           |
| role_permissions | Quyền của role            |
| user_roles       | Role của user             |
| sessions         | Phiên đăng nhập           |
| refresh_tokens   | Refresh token nếu sử dụng |
| mfa_methods      | Phương thức MFA           |
| access_grants    | Quyền được cấp riêng      |

## **3. Resource Management**

| Bảng               | Mục đích             |
| ------------------ | -------------------- |
| resources          | Metadata tài nguyên  |
| folders            | Cấu trúc thư mục     |
| resource_versions  | Phiên bản file       |
| resource_tags      | Tag tài nguyên       |
| tags               | Danh sách tag        |
| resource_shares    | Chia sẻ tài nguyên   |
| resource_favorites | Tài nguyên yêu thích |
| resource_comments  | Bình luận            |

## **4. Storage Management**

| Bảng              | Mục đích                 |
| ----------------- | ------------------------ |
| storage_providers | Nhà cung cấp lưu trữ     |
| storage_objects   | Thông tin object thực tế |
| upload_sessions   | Phiên upload             |
| storage_quotas    | Hạn mức dung lượng       |
| file_checksums    | Hash / checksum          |

## **5. System Management**

| Bảng            | Mục đích               |
| --------------- | ---------------------- |
| audit_logs      | Nhật ký kiểm toán      |
| notifications   | Thông báo              |
| projects        | Dự án                  |
| project_members | Thành viên dự án       |
| system_settings | Cấu hình hệ thống      |
| background_jobs | Theo dõi công việc nền |

Đây là danh sách định hướng, chưa phải schema cuối cùng. Một số bảng có thể gộp hoặc tách tùy theo thiết kế quan hệ.

# **VII. Kiến trúc Backend**

Với quy mô công ty vừa, mình khuyên dùng **Modular Monolith** thay vì Microservices ngay từ đầu.

Không cần chia thành hàng chục server và service riêng biệt khi hệ thống chưa có nhu cầu thực tế.

**Frontend – React**

Employee Portal / Admin Dashboard

**API Gateway / Express API**

Authentication · Validation · Rate Limiting

Auth Module

User Module

Permission Module

Resource Module

Storage Module

Sharing Module

Search Module

Audit Module

Notification Module

Admin Module


### **Công nghệ đề xuất**

| Thành phần    | Công nghệ                                              |
| ------------- | ------------------------------------------------------ |
| Frontend      | React+Javascrip thuần+Shadcn+taiwincss+lucireact                                                               |
| Backend       | Node.js + Express                                      |
| Database      | MySql                                                  |
| File Storage  | Google Driver/local / S3                               |
| Search        | PostgreSQL Full-text, sau này Elasticsearch/OpenSearch |
| Realtime      | WebSocket hoặc SSE                                     |
| Logging       | Pino + hệ thống tập trung                              |

Stack này tận dụng được nền tảng Node.js và SQL bạn đã học, đồng thời cho phép phát triển từng module độc lập.&#x20;

# **VIII. Thiết kế Frontend – Các trang cần xây dựng**

Mình đề xuất giao diện chia thành hai khu vực: Employee Portal và Admin Dashboard.

## **1. Employee Portal**
14

| Trang             | Chức năng               |
| ----------------- | ----------------------- |
| Dashboard         | Tổng quan tài nguyên    |
| My Files          | Tài nguyên cá nhân      |
| Shared With Me    | Tài nguyên được chia sẻ |
| Shared By Me      | Tài nguyên đã chia sẻ   |
| Company Files     | Tài nguyên toàn công ty |
| Departments       | Tài nguyên phòng ban    |
| Projects          | Tài nguyên dự án        |
| Recent Files      | File truy cập gần đây   |
| Favorites         | File yêu thích          |
| Trash             | Thùng rác               |
| Search            | Tìm kiếm tài nguyên     |
| Notifications     | Thông báo               |
| Profile           | Thông tin cá nhân       |
| Security Settings | Cài đặt bảo mật         |

## **2. Admin Dashboard**

11

| Trang                 | Chức năng          |
| --------------------- | ------------------ |
| Overview              | Tổng quan hệ thống |
| User Management       | Quản lý nhân viên  |
| Department Management | Quản lý phòng ban  |
| Team Management       | Quản lý nhóm       |
| Role Management       | Quản lý vai trò    |
| Permission Management | Quản lý quyền      |
| Resource Management   | Quản lý tài nguyên |
| Storage Management    | Quản lý dung lượng |
| Sharing Management    | Quản lý chia sẻ    |
| Audit Logs            | Nhật ký hệ thống   |
| Security              | Cấu hình bảo mật   |
| Backup Management     | Quản lý sao lưu    |
| System Settings       | Cấu hình hệ thống  |

# **IX. Các vấn đề vận hành không được bỏ qua**

Đối với hệ thống lưu trữ nội bộ, việc xây dựng chức năng upload/download mới chỉ là một nửa công việc. Bạn còn phải tính đến những vấn đề sau.

## **1. Backup & Disaster Recovery**

- Backup Database định kỳ.
- Backup Object Storage.
- Khôi phục dữ liệu.
- Kiểm tra khả năng Restore.
- Lưu bản backup ở vị trí độc lập.
- Chính sách giữ bản backup.
- RPO (Recovery Point Objective).
- RTO (Recovery Time Objective).

Không nên để backup duy nhất trên cùng một ổ đĩa hoặc máy chủ đang chạy hệ thống.

## **2. File Security**

- Kiểm tra MIME Type thực tế, không chỉ dựa vào phần mở rộng.
- Giới hạn kích thước upload.
- Quét malware.
- Chống path traversal.
- Ngăn upload file thực thi nguy hiểm.
- Mã hóa dữ liệu khi truyền tải (TLS).
- Mã hóa dữ liệu lưu trữ.
- Quản lý secret và storage credentials an toàn.

## **3. Data Lifecycle**

Cần có quy định rõ ràng về vòng đời dữ liệu:

```
UPLOAD
   |
   v
PENDING_SCAN
   |
   v
ACTIVE
   |
   +----> NEW VERSION
   |
   +----> TRASH
             |
             +----> RESTORE
             |
             +----> PERMANENT DELETE
```

Đặc biệt, cần phân biệt xóa mềm, xóa vĩnh viễn và chính sách lưu giữ tài liệu. Không nên cho phép nhân viên xóa vĩnh viễn tài liệu quan trọng mà không có cơ chế kiểm soát.

# **X. Lộ trình triển khai dự án**

Mình không khuyên bạn xây dựng tất cả 12 phân hệ cùng lúc. Nên chia thành các giai đoạn.

## **Phase 1 – Core System**

Ưu tiên cao nhất

**Mục tiêu:** Có một hệ thống lưu trữ và quản lý nhân viên hoạt động được.

- Authentication.
- User Management.
- Department Management.
- RBAC cơ bản.
- Upload / Download.
- Folder Management.
- File Management.
- Basic Search.
- Storage Quota.
  ## **Phase 2 – Permission & Collaboration**
  **Mục tiêu:** Chia sẻ tài nguyên an toàn và quản lý quyền chi tiết.
- Resource ACL.
- Department Scope.
- Project Scope.
- Sharing Links.
- Permission Inheritance.
- Version Control.
- Recycle Bin.
- Audit Logs.
  ## **Phase 3 – Advanced Features**
  **Mục tiêu:** Nâng cao trải nghiệm sử dụng.
- Advanced Search.
- File Preview.
- Full-text Search.
- Notifications.
- Comments.
- Favorites.
- Dashboard Statistics.
- Background Processing.
  ## **Phase 4 – Security & Reliability**
  **Mục tiêu:** Chuẩn bị vận hành thực tế.
- MFA / SSO.
- Malware Scanning.
- Encryption.
- Backup / Restore.
- Monitoring.
- Rate Limiting.
- Disaster Recovery.
- Security Audit.
  ## **Phase 5 – Scaling & Expansion**
  **Mục tiêu:** Mở rộng hệ thống theo nhu cầu công ty.
- Multiple Storage Providers.
- Storage Replication.
- Advanced Analytics.
- OCR / Document Indexing.
- Advanced Workflow.
- API Integration.
- Mobile Application.

# **XI. Những quyết định cần chốt trước khi bắt đầu thiết kế Database**

Có một số vấn đề ảnh hưởng trực tiếp đến kiến trúc hệ thống. Mình đưa ra phương án đề xuất ban đầu:

| Vấn đề            | Đề xuất                                    |
| ----------------- | ------------------------------------------ |
| Quy mô người dùng | Thiết kế linh hoạt, chưa hardcode số lượng |
| Đăng ký tài khoản | Chỉ Admin hoặc lời mời                     |
| Cấu trúc tổ chức  | Một công ty, nhiều phòng ban               |
| Lưu trữ           | Object Storage                             |
| Phân quyền        | RBAC + ACL                                 |
| Chia sẻ           | Nội bộ và bên ngoài                        |
| File lớn          | Multipart + Resumable                      |
| Phiên bản         | Có versioning                              |
| Xóa file          | Soft Delete + Retention                    |
| Triển khai        | Modular Monolith                           |