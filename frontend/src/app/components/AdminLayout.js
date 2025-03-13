
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
