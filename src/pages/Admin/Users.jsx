import { useEffect, useState } from "react";
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiX, FiShield, FiUser, FiLoader } from "react-icons/fi";
import api from "../../services/api.js";
import { showSuccess, showError } from "../../components/ui/ToastNotification.jsx";
import Button from "../../components/ui/Button.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const responseData = res?.data;

      let usersList = [];
      if (responseData?.data?.content) {
        usersList = responseData.data.content;
      } else if (Array.isArray(responseData?.data)) {
        usersList = responseData.data;
      } else if (Array.isArray(responseData)) {
        usersList = responseData;
      }

      setUsers(usersList);
    } catch (err) {
      console.error("Fetch users error:", err);
      showError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      role: "USER",
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      role: user.role || "USER",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setIsSubmitting(false);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      showError("Vui lòng nhập tên người dùng");
      return false;
    }
    if (!formData.email.trim()) {
      showError("Vui lòng nhập email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showError("Email không hợp lệ");
      return false;
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      showError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        role: formData.role,
      };

      if (editingUser) {
        const updatePayload = { ...payload };
        delete updatePayload.password;
        delete updatePayload.role;
        if (formData.role !== editingUser.role) {
          updatePayload.role = formData.role;
        }
        await api.put(`/users/${editingUser.id}`, updatePayload);
        showSuccess("Cập nhật người dùng thành công!");
      } else {
        if (formData.password) {
          payload.password = formData.password;
        }
        await api.post("/users", payload);
        showSuccess("Thêm người dùng thành công!");
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Submit user error:", err);
      const errorMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        (editingUser ? "Cập nhật thất bại" : "Thêm người dùng thất bại");
      showError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await api.delete(`/users/${userId}`);
      showSuccess("Xóa người dùng thành công!");
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      showError("Xóa người dùng thất bại");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phone: value });
  };

  const isAdminUser = (role) => {
    return role === "ADMIN";
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      searchTerm === "" ||
      (user.fullName || user.name || "").toLowerCase().includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      (user.phone || "").includes(searchTerm);

    const userRole = user.role || "USER";
    const matchRole =
      filterRole === "ALL" ||
      (filterRole === "ADMIN" && isAdminUser(userRole)) ||
      (filterRole === "USER" && !isAdminUser(userRole));

    return matchSearch && matchRole;
  });

  const getRoleBadge = (role) => {
    const isUserAdmin = isAdminUser(role);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isUserAdmin
            ? "bg-purple-500/20 text-purple-400"
            : "bg-blue-500/20 text-blue-400"
        }`}
      >
        {isUserAdmin ? "Admin" : "User"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý người dùng</h2>
          <p className="text-slate-400 text-sm mt-1">
            Tổng cộng: {filteredUsers.length} người dùng
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiUserPlus size={20} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel border-slate-700/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="glass-panel border-slate-700/50 p-12 text-center">
          <FiUser className="mx-auto text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="glass-panel border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                          {(user.fullName || user.name || user.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <p className="text-white font-medium text-sm">
                          {user.fullName || user.name || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <FiEdit2 className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md border-slate-700/80">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tên người dùng *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="VD: email@example.com"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Mật khẩu {editingUser ? "(để trống nếu không đổi)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder={editingUser ? "Để trống để giữ mật khẩu cũ" : "Mặc định: 123456"}
                    minLength={editingUser ? 0 : 6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="VD: 0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="VD: 123 Đường ABC, TP.HCM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vai trò
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "USER" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      formData.role === "USER"
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-slate-600 bg-slate-700 text-slate-400"
                    }`}
                  >
                    <FiUser size={16} />
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      formData.role === "ADMIN"
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-slate-600 bg-slate-700 text-slate-400"
                    }`}
                  >
                    <FiShield size={16} />
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin mx-auto" />
                  ) : editingUser ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
