# Full offline Figma capture specification

Một node chỉ được đánh dấu `complete` khi dataset chứa đủ dữ liệu để các lần sinh code và audit không cần gọi lại Figma MCP:

1. `design-context.md`: toàn bộ reference code và hướng dẫn semantic do `get_design_context` trả về; thay URL asset tạm bằng đường dẫn cục bộ.
2. `metadata.json`: dataset version, file key, node ID, frame name, loại node, kích thước tự nhiên, thời điểm capture, tham số framework/language, trạng thái Code Connect và phiên bản capture schema.
3. `screenshot.png`: ảnh context đúng node ở độ phân giải đủ đọc chi tiết.
4. `export.png`: render toàn node từ `download_assets`.
5. `assets/`: toàn bộ raw images và SVG assets MCP trả về; manifest ghi rõ mọi cờ truncated.
6. `asset-map.json`: ánh xạ URL/identifier trong design context sang file cục bộ, MIME type, kích thước byte và SHA-256.
7. `checksums.sha256`: checksum của mọi file dữ liệu trong version.

## Không được coi là complete

- Chỉ có screenshot/export.
- Thiếu design context hoặc metadata.
- Asset bị truncated nhưng chưa được ghi nhận và xử lý.
- Context còn phụ thuộc URL tạm.
- Checksum thiếu hoặc sai.
- Node ID được suy đoán thay vì xác minh qua plugin.

Dataset là snapshot bất biến theo phiên bản. Thay đổi trên Figma phải được lấy bằng một capture run mới và tạo version mới; generation và audit dùng cùng một version để bảo đảm tái lập.
