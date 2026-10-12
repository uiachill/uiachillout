import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Users, DollarSign, Database, Printer, Search, Plus,
  Trash2, Edit, Calculator, LogOut, Clock, FileText, Award, Download, FileDown, ChevronLeft, ChevronRight, Lock, Menu, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const NGUYEN_TAC_NGAY_CONG = 31;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- STATE CHO GIAO DIỆN ĐIỆN THOẠI ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE CHO ĐĂNG NHẬP ---
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    Ma_nhan_vien: '', Ho_ten: '', Phong_ban: 'Phòng Kỹ Thuật',
    Chuc_vu: 'Nhân viên', Luong_co_ban: 10000000, Mat_khau: '123456'
  });

  const [phongBan] = useState(() => JSON.parse(localStorage.getItem('phongBan')) || [
    { id: 'PB01', name: 'Phòng Kỹ Thuật' }, { id: 'PB02', name: 'Phòng Kinh Doanh' }, { id: 'PB03', name: 'Phòng Nhân Sự' }
  ]);

  const [nhanVien, setNhanVien] = useState(() => JSON.parse(localStorage.getItem('nhanVien')) || [
    { Ma_nhan_vien: 'NV01', Ho_ten: 'Nguyễn Nhật Minh', Phong_ban: 'Phòng Kỹ Thuật', Luong_co_ban: 15000000, Chuc_vu: 'Lập trình viên', Mat_khau: '123456' },
    { Ma_nhan_vien: 'NV02', Ho_ten: 'Đỗ Thị Trà My', Phong_ban: 'Phòng Kỹ Thuật', Luong_co_ban: 12000000, Chuc_vu: 'Tester', Mat_khau: '123456' },
    { Ma_nhan_vien: 'NV03', Ho_ten: 'Nguyễn Tuấn Minh', Phong_ban: 'Phòng Kinh Doanh', Luong_co_ban: 18000000, Chuc_vu: 'Trưởng phòng', Mat_khau: '123456' },
    { Ma_nhan_vien: 'NV04', Ho_ten: 'Phạm Đình An', Phong_ban: 'Phòng Nhân Sự', Luong_co_ban: 14000000, Chuc_vu: 'CODE', Mat_khau: '123456' },
    { Ma_nhan_vien: 'NV05', Ho_ten: 'Hoàng Yến Nhi', Phong_ban: 'Phòng Kinh Doanh', Luong_co_ban: 11000000, Chuc_vu: 'Sales', Mat_khau: '123456' },
    { Ma_nhan_vien: 'NV07', Ho_ten: 'Ngô Thái Hòa', Phong_ban: 'Phòng Kinh Doanh', Luong_co_ban: 8000000, Chuc_vu: 'Sales', Mat_khau: '123456' },
  ]);

  const [chamCong, setChamCong] = useState(() => JSON.parse(localStorage.getItem('chamCong')) || nhanVien.map(nv => ({
    Ma_nhan_vien: nv.Ma_nhan_vien, So_ngay_cong: NGUYEN_TAC_NGAY_CONG, So_ngay_nghi: 0, Gio_tang_ca: Math.floor(Math.random() * 10)
  })));

  const [hoaDon, setHoaDon] = useState(() => JSON.parse(localStorage.getItem('hoaDon')) || [
    { Ma_HD: 'HD01', Ma_nhan_vien: 'NV03', Gia_tri: 50000000 },
    { Ma_HD: 'HD02', Ma_nhan_vien: 'NV05', Gia_tri: 25000000 }
  ]);

  const [phuCap] = useState(() => JSON.parse(localStorage.getItem('phuCap')) || [
    { Loai: 'Ăn trưa', So_tien: 1000000 }, { Loai: 'Xăng xe', So_tien: 500000 }
  ]);

  const [bangLuong, setBangLuong] = useState(() => JSON.parse(localStorage.getItem('bangLuong')) || []);

  useEffect(() => {
    localStorage.setItem('nhanVien', JSON.stringify(nhanVien));
    localStorage.setItem('chamCong', JSON.stringify(chamCong));
    localStorage.setItem('hoaDon', JSON.stringify(hoaDon));
    localStorage.setItem('bangLuong', JSON.stringify(bangLuong));
  }, [nhanVien, chamCong, hoaDon, bangLuong]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginId === 'ADMIN' && loginPassword === 'admin') {
      setCurrentUser({ id: 'ADMIN', name: 'Giám Đốc CSDL', role: 'admin' });
      return;
    }
    const user = nhanVien.find(nv => nv.Ma_nhan_vien === loginId && nv.Mat_khau === loginPassword);
    if (user) {
      setCurrentUser({ id: user.Ma_nhan_vien, name: user.Ho_ten, role: 'user' });
    } else {
      alert('Sai Mã nhân viên hoặc Mật khẩu. Vui lòng thử lại!');
    }
  };

  const handleTinhLuong = () => {
    const ketQua = nhanVien.map(nv => {
      const cc = chamCong.find(c => c.Ma_nhan_vien === nv.Ma_nhan_vien) || { So_ngay_cong: NGUYEN_TAC_NGAY_CONG, Gio_tang_ca: 0 };
      const luongThucTe = (nv.Luong_co_ban / NGUYEN_TAC_NGAY_CONG) * cc.So_ngay_cong;
      const luongGio = nv.Luong_co_ban / NGUYEN_TAC_NGAY_CONG / 8;
      const tienTangCa = cc.Gio_tang_ca * luongGio * 1.5;
      const tongPhuCap = phuCap.reduce((sum, pc) => sum + pc.So_tien, 0);
      const hdNhanVien = hoaDon.filter(h => h.Ma_nhan_vien === nv.Ma_nhan_vien);
      const doanhThu = hdNhanVien.reduce((sum, h) => sum + h.Gia_tri, 0);
      const hoaHong = nv.Phong_ban === 'Phòng Kinh Doanh' ? doanhThu * 0.05 : 0;
      const tongThuNhap = luongThucTe + tienTangCa + tongPhuCap + hoaHong;
      const baoHiem = nv.Luong_co_ban * 0.105;
      const thuNhapChiuThue = tongThuNhap - baoHiem;
      const thueTNCN = thuNhapChiuThue > 11000000 ? (thuNhapChiuThue - 11000000) * 0.05 : 0;
      const thucLanh = tongThuNhap - baoHiem - thueTNCN;

      return {
        Ma_nhan_vien: nv.Ma_nhan_vien, Ho_ten: nv.Ho_ten, Phong_ban: nv.Phong_ban,
        Luong_Thuc_Te: luongThucTe, Tien_Tang_Ca: tienTangCa, Phu_Cap: tongPhuCap,
        Hoa_Hong: hoaHong, Khau_Tru: baoHiem + thueTNCN, Tong_Thu_Nhap: tongThuNhap, Thuc_Lanh: thucLanh
      };
    });
    setBangLuong(ketQua);
    alert('Hệ thống AI đã tính toán xong lương tháng này!');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bangLuong.map(bl => ({
      "Mã NV": bl.Ma_nhan_vien, "Họ Tên": bl.Ho_ten, "Phòng Ban": bl.Phong_ban,
      "Tổng Thu Nhập": Math.round(bl.Tong_Thu_Nhap), "Khấu Trừ": Math.round(bl.Khau_Tru), "Thực Lãnh": Math.round(bl.Thuc_Lanh)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BangLuong");
    XLSX.writeFile(wb, "BangLuong_Thang.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("BANG LUONG NHAN VIEN - SMART PAYROLL", 14, 15);
    const tableColumn = ["Ma NV", "Ho Ten", "Phong Ban", "Tong Thu Nhap", "Thuc Lanh"];
    const tableRows = bangLuong.map(bl => [
      bl.Ma_nhan_vien, bl.Ho_ten, bl.Phong_ban,
      `${Math.round(bl.Tong_Thu_Nhap).toLocaleString()} VND`,
      `${Math.round(bl.Thuc_Lanh).toLocaleString()} VND`
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("BangLuong.pdf");
  };

  const filteredEmployees = useMemo(() => {
    return nhanVien.filter(nv => {
      const matchSearch = nv.Ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || nv.Ma_nhan_vien.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = filterDept === 'All' || nv.Phong_ban === filterDept;
      const matchUser = currentUser?.role === 'admin' || nv.Ma_nhan_vien === currentUser?.id;
      return matchSearch && matchDept && matchUser;
    });
  }, [nhanVien, searchTerm, filterDept, currentUser]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveEmployee = () => {
    if (!formData.Ma_nhan_vien || !formData.Ho_ten) return alert("Vui lòng điền đủ thông tin!");
    if (editingEmployee) {
      setNhanVien(nhanVien.map(nv => nv.Ma_nhan_vien === formData.Ma_nhan_vien ? formData : nv));
    } else {
      if (nhanVien.find(nv => nv.Ma_nhan_vien === formData.Ma_nhan_vien)) return alert("Mã NV đã tồn tại!");
      setNhanVien([...nhanVien, formData]);
      setChamCong([...chamCong, { Ma_nhan_vien: formData.Ma_nhan_vien, So_ngay_cong: NGUYEN_TAC_NGAY_CONG, So_ngay_nghi: 0, Gio_tang_ca: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("Cảnh báo: Thao tác này sẽ xóa nhân viên và toàn bộ dữ liệu liên quan. Bạn chắc chứ?")) {
      setNhanVien(nhanVien.filter(nv => nv.Ma_nhan_vien !== id));
      setChamCong(chamCong.filter(cc => cc.Ma_nhan_vien !== id));
      setHoaDon(hoaDon.filter(hd => hd.Ma_nhan_vien !== id));
    }
  };

  const updateChamCong = (id, field, value) => {
    setChamCong(chamCong.map(cc => cc.Ma_nhan_vien === id ? { ...cc, [field]: Number(value) } : cc));
  };

  const handleAddHoaDon = () => {
    const maHD = `HD0${hoaDon.length + 1}`;
    const maNV = prompt("Nhập Mã Nhân Viên lập hóa đơn (VD: NV03):");
    if (!maNV) return;
    const giaTri = prompt("Nhập Giá trị Hóa đơn (VNĐ) - Ví dụ: 15000000:");
    if (!giaTri || isNaN(giaTri)) return alert("Giá trị không hợp lệ!");
    setHoaDon([...hoaDon, { Ma_HD: maHD, Ma_nhan_vien: maNV, Gia_tri: Number(giaTri) }]);
  };

  const handleDeleteHoaDon = (id) => {
    if (window.confirm("Xóa hóa đơn này sẽ làm giảm Tổng Doanh Thu. Tiếp tục?")) {
      setHoaDon(hoaDon.filter(hd => hd.Ma_HD !== id));
    }
  };

  const quyLuongDuToan = bangLuong.length > 0
    ? bangLuong.reduce((s, i) => s + i.Tong_Thu_Nhap, 0)
    : nhanVien.reduce((s, nv) => s + nv.Luong_co_ban, 0);
  const tongDoanhThu = hoaDon.reduce((s, h) => s + h.Gia_tri, 0);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-900 to-slate-900 px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-[450px] border border-white/20 backdrop-blur-sm">
          <div className="flex justify-center mb-6"><div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/50"><Lock className="w-10 h-10 text-white" /></div></div>
          <h1 className="text-2xl md:text-3xl font-black text-center text-slate-800 mb-2">CSDL lớp 11A4</h1>
          <p className="text-center text-slate-500 mb-8 font-medium">Hệ thống Quản lý & Xác thực</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mã Nhân Viên</label>
              <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} required placeholder="VD: ADMIN hoặc NV01"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mật Khẩu</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="Nhập mật khẩu..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl flex justify-center items-center gap-2 mt-2">
              <Lock className="w-5 h-5" /> Đăng Nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-blue-200">

      {/* Lớp nền tối mờ khi mở Menu trên Điện thoại */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* THANH MENU (Sidebar) - Đã cấu hình Responsive trượt ngang */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-[280px] bg-[#0B1121] flex flex-col shadow-2xl shadow-blue-900/20 z-40 shrink-0 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="p-7 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30"><Calculator className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight">SmartPayroll</h1>
              <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">{currentUser.role === 'admin' ? 'Admin Portal' : 'User Portal'}</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Module Quản Lý</p>
          {[
            { id: 'dashboard', label: 'Dashboard Tổng', icon: LayoutDashboard, auth: 'all' },
            { id: 'nhan-vien', label: 'Hồ Sơ Nhân Sự', icon: Users, auth: 'all' },
            { id: 'cham-cong', label: 'Theo Dõi Chấm Công', icon: Clock, auth: 'admin' },
            { id: 'thu-nhap', label: 'Hóa Đơn & Phụ Cấp', icon: FileText, auth: 'admin' },
            { id: 'luong', label: 'Kết Xuất Bảng Lương', icon: DollarSign, auth: 'all' },
          ].filter(item => item.auth === 'all' || currentUser.role === 'admin').map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group ${activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-900/30 translate-x-1' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400 transition-colors'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">{currentUser.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.id}</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setLoginId(''); setLoginPassword(''); }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"><LogOut className="w-5 h-5" /></button>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-medium uppercase tracking-widest">Đồ án CSDL © Nhóm Tuấn Minh</p>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 bg-slate-50/50 w-full">

        {/* HEADER ĐIỆN THOẠI (Chỉ hiện trên màn hình nhỏ) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl"><Calculator className="w-5 h-5 text-white" /></div>
            <h1 className="font-black text-xl text-slate-800">SmartPayroll</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 md:mb-8 tracking-tight">Tổng Quan Hệ Thống</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { t: 'Tổng Nhân Sự', v: nhanVien.length, i: Users, c: 'blue' },
                { t: 'Quỹ Lương (Dự kiến)', v: `${Math.round(quyLuongDuToan).toLocaleString()} đ`, i: DollarSign, c: 'emerald' },
                { t: 'Tổng Doanh Thu', v: `${Math.round(tongDoanhThu).toLocaleString()} đ`, i: Database, c: 'purple' },
                { t: 'Phòng Ban', v: phongBan.length, i: LayoutDashboard, c: 'orange' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 md:p-4 rounded-2xl bg-${kpi.c}-50 text-${kpi.c}-600 ring-1 ring-${kpi.c}-100 shrink-0`}><kpi.i className="w-6 h-6 md:w-7 md:h-7" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1 truncate">{kpi.t}</p>
                      <p className="text-lg md:text-xl lg:text-2xl font-black text-slate-800 truncate" title={kpi.v}>{kpi.v}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentUser.role === 'admin' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col h-[350px] lg:h-auto">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-500" /> Phân tích Quỹ lương</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bangLuong.length ? bangLuong : nhanVien.map(n => ({ Ho_ten: n.Ho_ten, Thuc_Lanh: n.Luong_co_ban, Tong_Thu_Nhap: n.Luong_co_ban * 1.1 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="Ho_ten" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} dy={10} />
                        <YAxis tickFormatter={v => `${v / 1000000}Tr`} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                        <Tooltip formatter={v => v.toLocaleString() + ' đ'} cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Thuc_Lanh" name="Thực Lãnh" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Tong_Thu_Nhap" name="Tổng Chi Phí" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col h-[350px] lg:h-auto">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" /> Phân bổ Nhân sự</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={phongBan.map(pb => ({ name: pb.name, value: nhanVien.filter(nv => nv.Phong_ban === pb.name).length }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {phongBan.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-3xl text-center shadow-sm border border-slate-200">
                <Lock className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-slate-700">Dữ liệu phân tích giới hạn</h3>
                <p className="text-sm md:text-base text-slate-500 mt-2">Chỉ cấp Quản lý (Admin) mới có quyền truy cập báo cáo tổng thể doanh nghiệp.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nhan-vien' && (
          <div className="p-4 md:p-8 lg:p-10 flex flex-col h-full max-w-[1400px] mx-auto w-full animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 shrink-0">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Hồ Sơ Nhân Sự</h2>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
                  <input type="text" placeholder="Tìm mã hoặc tên..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-shadow" />
                </div>
                <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }} className="w-full sm:w-auto py-2.5 px-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm cursor-pointer">
                  <option value="All">Tất cả phòng ban</option>
                  {phongBan.map(pb => <option key={pb.id} value={pb.name}>{pb.name}</option>)}
                </select>
                {currentUser.role === 'admin' && (
                  <button onClick={() => { setEditingEmployee(null); setFormData({ Ma_nhan_vien: '', Ho_ten: '', Phong_ban: 'Phòng Kỹ Thuật', Chuc_vu: 'Nhân viên', Luong_co_ban: 10000000, Mat_khau: '123456' }); setIsModalOpen(true); }}
                    className="w-full sm:w-auto justify-center bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95">
                    <Plus className="w-5 h-5" /> <span>Thêm Mới</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                  <thead className="bg-slate-50/90 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                    <tr>
                      {['Mã NV', 'Họ và Tên', 'Phòng Ban', 'Chức Vụ', 'Lương Cơ Bản', 'Thao Tác'].map((h, i) => (
                        <th key={i} className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEmployees.map((nv) => (
                      <tr key={nv.Ma_nhan_vien} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="p-4 md:p-5 font-bold text-blue-600">{nv.Ma_nhan_vien}</td>
                        <td className="p-4 md:p-5 text-slate-800 font-bold text-base">{nv.Ho_ten}</td>
                        <td className="p-4 md:p-5"><span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-200">{nv.Phong_ban}</span></td>
                        <td className="p-4 md:p-5 text-slate-600 font-medium">{nv.Chuc_vu || 'Nhân viên'}</td>
                        <td className="p-4 md:p-5 text-slate-800 font-bold">{nv.Luong_co_ban.toLocaleString()} đ</td>
                        <td className="p-4 md:p-5">
                          {currentUser.role === 'admin' ? (
                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingEmployee(nv); setFormData(nv); setIsModalOpen(true); }} className="p-2 bg-blue-50 md:bg-transparent text-blue-500 hover:bg-blue-100 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteEmployee(nv.Ma_nhan_vien)} className="p-2 bg-red-50 md:bg-transparent text-red-500 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ) : <Lock className="w-4 h-4 text-slate-300" />}
                        </td>
                      </tr>
                    ))}
                    {paginatedEmployees.length === 0 && (
                      <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-medium">Không tìm thấy dữ liệu phù hợp.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <span className="text-sm text-slate-500 font-medium text-center sm:text-left">Hiển thị {paginatedEmployees.length} / {filteredEmployees.length} kết quả</span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-100"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-100"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL THÊM / SỬA NHÂN VIÊN */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-[550px] max-h-[90vh] overflow-y-auto border border-slate-200">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6">{editingEmployee ? 'Chỉnh sửa Hồ sơ' : 'Thêm Nhân viên Mới'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mã Nhân Viên</label>
                    <input type="text" value={formData.Ma_nhan_vien} onChange={e => setFormData({ ...formData, Ma_nhan_vien: e.target.value })} disabled={!!editingEmployee} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Họ và Tên</label>
                    <input type="text" value={formData.Ho_ten} onChange={e => setFormData({ ...formData, Ho_ten: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phòng Ban</label>
                    <select value={formData.Phong_ban} onChange={e => setFormData({ ...formData, Phong_ban: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                      {phongBan.map(pb => <option key={pb.id} value={pb.name}>{pb.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lương Cơ Bản (VNĐ)</label>
                    <input type="number" value={formData.Luong_co_ban} onChange={e => setFormData({ ...formData, Luong_co_ban: Number(e.target.value) })} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chức Vụ</label>
                    <input type="text" value={formData.Chuc_vu} onChange={e => setFormData({ ...formData, Chuc_vu: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700" placeholder="VD: Lập trình viên" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-red-500">Mật Khẩu Đăng Nhập</label>
                    <input type="text" value={formData.Mat_khau} onChange={e => setFormData({ ...formData, Mat_khau: e.target.value })} className="w-full p-3 bg-white border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-600" placeholder="Mật khẩu cấp cho NV" />
                  </div>
                </div>

              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">Hủy</button>
                <button onClick={handleSaveEmployee} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95">Lưu Dữ Liệu</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cham-cong' && currentUser.role === 'admin' && (
          <div className="p-4 md:p-8 lg:p-10 flex flex-col h-full max-w-[1400px] mx-auto w-full animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 shrink-0">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Quản Lý Chấm Công</h2>
              <div className="w-full sm:w-auto justify-center bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5" /> Tháng hiện tại: {NGUYEN_TAC_NGAY_CONG} ngày chuẩn</div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left relative whitespace-nowrap min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <tr><th className="p-4 md:p-5 font-black text-slate-500 uppercase tracking-widest">Mã NV</th><th className="p-4 md:p-5 font-black text-slate-500 uppercase tracking-widest">Ngày đi làm thực tế</th><th className="p-4 md:p-5 font-black text-slate-500 uppercase tracking-widest">Giờ Tăng Ca</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chamCong.map((cc) => (
                      <tr key={cc.Ma_nhan_vien} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 md:p-5 font-bold text-slate-700">{cc.Ma_nhan_vien}</td>
                        <td className="p-4 md:p-5">
                          <input type="number" min="0" max="31" value={cc.So_ngay_cong} onChange={(e) => updateChamCong(cc.Ma_nhan_vien, 'So_ngay_cong', e.target.value)}
                            className="w-20 md:w-24 p-2 bg-white border border-slate-300 rounded-lg text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" /> / {NGUYEN_TAC_NGAY_CONG}
                        </td>
                        <td className="p-4 md:p-5">
                          <input type="number" min="0" value={cc.Gio_tang_ca} onChange={(e) => updateChamCong(cc.Ma_nhan_vien, 'Gio_tang_ca', e.target.value)}
                            className="w-20 md:w-24 p-2 bg-white border border-slate-300 rounded-lg text-center font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 outline-none" /> giờ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'thu-nhap' && currentUser.role === 'admin' && (
          <div className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full h-full overflow-y-auto animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 shrink-0">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Hóa Đơn & Phụ Cấp</h2>
              <button onClick={handleAddHoaDon} className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95">
                <Plus className="w-5 h-5" /> <span>Thêm Hóa Đơn (Tăng Doanh Thu)</span>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2 md:mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Hóa Đơn Phát Sinh (Kinh Doanh)</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-4">Nhân viên lập hóa đơn sẽ được AI cộng 5% hoa hồng vào lương.</p>
                <div className="overflow-y-auto overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left bg-slate-50 rounded-xl overflow-hidden relative whitespace-nowrap min-w-[400px]">
                    <thead className="bg-slate-100 sticky top-0"><tr><th className="p-3 text-xs font-bold text-slate-600 uppercase">Mã HD</th><th className="p-3 text-xs font-bold text-slate-600 uppercase">Mã NV</th><th className="p-3 text-xs font-bold text-slate-600 uppercase">Giá Trị (VNĐ)</th><th className="p-3 text-center">Thao tác</th></tr></thead>
                    <tbody className="divide-y divide-slate-200">{hoaDon.map(hd => <tr key={hd.Ma_HD} className="hover:bg-white group"><td className="p-3 font-semibold">{hd.Ma_HD}</td><td className="p-3 text-blue-600 font-bold">{hd.Ma_nhan_vien}</td><td className="p-3 text-emerald-600 font-bold">{hd.Gia_tri.toLocaleString()} đ</td>
                      <td className="p-3 text-center"><button onClick={() => handleDeleteHoaDon(hd.Ma_HD)} className="text-red-400 hover:text-red-600 p-1 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 md:bg-transparent"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>)}
                      {hoaDon.length === 0 && (<tr><td colSpan="4" className="p-6 text-center text-slate-400">Chưa có hóa đơn nào</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2 md:mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-500" /> Phụ Cấp Cố Định (Toàn công ty)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left bg-slate-50 rounded-xl overflow-hidden whitespace-nowrap min-w-[300px]">
                    <thead className="bg-slate-100"><tr><th className="p-3 text-xs font-bold text-slate-600 uppercase">Loại Phụ Cấp</th><th className="p-3 text-xs font-bold text-slate-600 uppercase">Số Tiền (VNĐ)</th></tr></thead>
                    <tbody className="divide-y divide-slate-200">{phuCap.map((pc, i) => <tr key={i}><td className="p-3 font-semibold">{pc.Loai}</td><td className="p-3 text-emerald-600 font-bold">+{pc.So_tien.toLocaleString()} đ</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'luong' && (
          <div className="p-4 md:p-8 lg:p-10 flex flex-col h-full max-w-[1400px] mx-auto w-full animate-in fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8 bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200 shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800">Kết Xuất Bảng Lương</h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Dựa trên logic: Lương ngày + Tăng ca + Phụ cấp + Hoa hồng - Bảo hiểm - Thuế</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
                {currentUser.role === 'admin' && (
                  <button onClick={handleTinhLuong} className="flex-1 lg:flex-none justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 md:px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 text-sm md:text-base">
                    <Calculator className="w-4 h-4 md:w-5 md:h-5" /> <span>Chạy AI Tính Lương</span>
                  </button>
                )}
                <button onClick={exportToExcel} disabled={bangLuong.length === 0} className="flex-1 lg:flex-none justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 md:px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-colors disabled:opacity-50 text-sm md:text-base">
                  <FileDown className="w-4 h-4 md:w-5 md:h-5" /> Excel
                </button>
                <button onClick={exportToPDF} disabled={bangLuong.length === 0} className="flex-1 lg:flex-none justify-center bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 md:px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-colors disabled:opacity-50 text-sm md:text-base">
                  <Download className="w-4 h-4 md:w-5 md:h-5" /> PDF
                </button>
                <button onClick={() => window.print()} className="flex-1 lg:flex-none justify-center bg-slate-800 text-white hover:bg-slate-900 px-3 md:px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-colors text-sm md:text-base">
                  <Printer className="w-4 h-4 md:w-5 md:h-5" /> In
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 print:shadow-none print:border-none print:overflow-visible">
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead className="bg-slate-50/90 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 shadow-sm print:bg-white print:relative">
                    <tr>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase">Mã NV</th>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase">Họ Tên</th>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase text-right">Lương Thực Tế</th>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase text-right">Tăng Ca</th>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase text-right">Thưởng/Phụ Cấp</th>
                      <th className="p-4 md:p-5 text-xs font-black text-slate-500 uppercase text-right">Khấu Trừ (BH+Thuế)</th>
                      <th className="p-4 md:p-5 text-sm font-black text-slate-800 uppercase text-right bg-emerald-50/50">Thực Lãnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bangLuong.length === 0 ? (
                      <tr><td colSpan="7" className="p-10 md:p-16 text-center text-slate-400 font-medium text-base md:text-lg">Chưa có dữ liệu bảng lương. Vui lòng chạy tính toán.</td></tr>
                    ) : (
                      bangLuong.filter(bl => currentUser.role === 'admin' || bl.Ma_nhan_vien === currentUser.id).map((bl, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 md:p-5 font-bold text-blue-600">{bl.Ma_nhan_vien}</td>
                          <td className="p-4 md:p-5 text-slate-800 font-bold">{bl.Ho_ten}</td>
                          <td className="p-4 md:p-5 text-slate-600 font-medium text-right">{Math.round(bl.Luong_Thuc_Te).toLocaleString()} đ</td>
                          <td className="p-4 md:p-5 text-amber-600 font-medium text-right">+{Math.round(bl.Tien_Tang_Ca).toLocaleString()} đ</td>
                          <td className="p-4 md:p-5 text-purple-600 font-medium text-right">+{Math.round(bl.Phu_Cap + bl.Hoa_Hong).toLocaleString()} đ</td>
                          <td className="p-4 md:p-5 text-red-500 font-medium text-right">-{Math.round(bl.Khau_Tru).toLocaleString()} đ</td>
                          <td className="p-4 md:p-5 text-emerald-600 font-black text-base md:text-lg text-right bg-emerald-50/30">{Math.round(bl.Thuc_Lanh).toLocaleString()} đ</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}