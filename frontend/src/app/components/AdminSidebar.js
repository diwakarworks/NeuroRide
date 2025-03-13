import Link from "next/link";

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <Link href="/admin/users">
          <p className="py-2 px-4 rounded hover:bg-gray-700">Manage Users</p>
        </Link>
        <Link href="/admin/rides">
          <p className="py-2 px-4 rounded hover:bg-gray-700">Monitor Rides</p>
        </Link>
        <Link href="/admin/payments">
          <p className="py-2 px-4 rounded hover:bg-gray-700">Payments & Earnings</p>
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
