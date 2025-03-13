import Link from "next/link";
import { Poppins } from 'next/font/google';

// Create a font variable
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const Navbar = () => {
  return (
    <nav className={`bg-blue-400 shadow-md py-4 px-6 flex justify-between items-center ${poppins.className}`}>
      <Link href="/" className={`text-2xl  font-semibold  ${poppins.className}`}>NeuroRide</Link>
      <div className="space-x-6 text-gray-800 font-medium">
        <Link href="/auth/login" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Login</Link>
        <Link href="/rider/dashboard" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Rider</Link>
        <Link href="/driver/home" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Driver</Link>
        <Link href="/admin/dashboard" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Admin</Link>
        <Link href="/auth/profile" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Profile</Link>
        <Link href="/rider/book-ride" className="hover:underline hover:text-gray-700 hover:text-opacity-100 font-semibold">Get a ride</Link>
      </div>
    </nav>
  );
};

export default Navbar;