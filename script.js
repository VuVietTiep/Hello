
// ---------- CẤU HÌNH ----------
const ADMIN_TOKEN = "mytile"; // <-- Thay token này bằng token của bạn
const countAPI = "https://api.countapi.xyz";
const namespace = "vu-viet-tiep-demo"; // đổi tuỳ ý
const key = "unique-visitors";         // đổi tuỳ ý
// --------------------------------

// Hiệu ứng sparkles
(function makeSparkles(){
  const sparkles = document.querySelector('.sparkles');
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 4 + 's';
    s.style.animationDuration = 3 + Math.random() * 3 + 's';
    sparkles.appendChild(s);
  }
})();

// Helper: lấy param từ URL
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Kiểm tra admin: 1) qstring admintoken khớp ADMIN_TOKEN => lưu vào localStorage
//                 2) Hoặc đã có flag isAdmin trong localStorage
function checkAdmin() {
  const param = getQueryParam('admintoken');
  if (param && param === ADMIN_TOKEN) {
    localStorage.setItem('isAdmin_view', '1');
    return true;
  }
  return localStorage.getItem('isAdmin_view') === '1';
}

// Hiển thị bộ đếm (chỉ admin)
async function showCounterIfAdmin() {
  const isAdmin = checkAdmin();
  const counterBox = document.getElementById('counterBox');

  if (!isAdmin) {
    // không phải admin: chắc chắn ẩn phần counter (đảm bảo)
    if (counterBox) counterBox.classList.add('hidden');
    return;
  }

  // admin: hiện phần counter
  if (counterBox) {
    counterBox.classList.remove('hidden');
    counterBox.setAttribute('aria-hidden', 'false');
  }

  // cập nhật giá trị (vẫn dùng logic localStorage + CountAPI như trước)
  await updateUniqueCountAndDisplay();
  // cập nhật định kỳ (tuỳ chọn)
  setInterval(updateUniqueCountAndDisplay, 30000);
}

// Hàm tăng đếm nếu visitor này chưa được tính
async function updateUniqueCountAndDisplay() {
  try {
    let visitorId = localStorage.getItem("uniqueVisitorId");
    if (!visitorId) {
      // tạo ID cho thiết bị (v4)
      if (crypto && crypto.randomUUID) {
        visitorId = crypto.randomUUID();
      } else {
        // fallback
        visitorId = 'id-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      }
      localStorage.setItem("uniqueVisitorId", visitorId);

      // tăng 1 lần
      await fetch(`${countAPI}/hit/${namespace}/${key}`);
    }

    // lấy tổng hiện tại
    const res = await fetch(`${countAPI}/get/${namespace}/${key}`);
    const data = await res.json();
    const el = document.getElementById("visitCount");
    if (el) el.textContent = (data && typeof data.value !== 'undefined') ? data.value : '0';
  } catch (err) {
    console.error('CountAPI error:', err);
    const el = document.getElementById("visitCount");
    if (el) el.textContent = '—';
  }
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
  showCounterIfAdmin();
});
