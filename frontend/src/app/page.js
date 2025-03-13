import Navbar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import Image from "next/image";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center text-center lg:text-left py-20 px-6  bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="lg:w-1/2">
          <h2 className="text-5xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Find a Ride or Drive & Earn
          </h2>
          <p className="text-gray-600 max-w-xl">
            Seamlessly book rides or earn money as a driver. Experience the fastest and most reliable ride-sharing service.
          </p>
          <div className="mt-6 space-x-4">
            <a href="/rider/book-ride" className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:shadow-xl">
              Find a Ride
            </a>
            <a href="/auth/login" className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 hover:shadow-xl">
              Become a Driver
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <Image
            src="/hero-image.webp"
            alt="Ride sharing illustration"
            width={500}
            height={400}
            className="rounded-lg ml-60 shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16  -mt-10 px-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-purple-600 mb-6">Connecting Communities Through Mobility</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            A ride is more than just transportation: It's access to job opportunities, community events, and essentials like groceries and healthcare. NeuroRide makes rides more accessible, bringing communities closer.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <h4 className="font-semibold text-purple-600">Opportunity</h4>
              <p className="mt-2 text-gray-600">Connecting people to jobs and economic opportunities</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
              <h4 className="font-semibold text-pink-600">Accessibility</h4>
              <p className="mt-2 text-gray-600">Making healthcare and essential services reachable for all</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
              <h4 className="font-semibold text-indigo-600">Community</h4>
              <p className="mt-2 text-gray-600">Bridging distances between people and the places they love</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-200 -mt-10 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">Why Choose NeuroRide?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 hover:border-b-4 hover:border-blue-400">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-blue-600">Fast & Reliable</h4>
              <p className="text-gray-600 mt-2">Get matched with a driver in seconds and reach your destination quickly.</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 hover:border-b-4 hover:border-blue-400">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-blue-600">Affordable Pricing</h4>
              <p className="text-gray-600 mt-2">Transparent pricing with no hidden fees. Pay only for what you ride.</p>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 hover:border-b-4 hover:border-blue-400">
              <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-blue-600">Secure & Safe</h4>
              <p className="text-gray-600 mt-2">Our drivers are verified, and every ride is tracked for your safety.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Solutions Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image Column */}
            <div className="lg:w-1/2">
              <div className="relative -mt-40 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/Passengers.webp"
                  alt="Business transportation solutions"
                  width={600}
                  height={450}
                  className="w-full mt-4 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/70 to-transparent p-6">
                  <span className="text-white text-sm font-medium px-3 py-1 bg-blue-600 rounded-full">For Enterprises</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Accelerate your business</span>
              </h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Provide reliable rides for the people who matter to your business. Whether it's team members heading into work or clients flying into town.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-800 mb-2">Corporate Accounts</h4>
                  <p className="text-gray-600">Centralized billing and streamlined expense management</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                  <h4 className="font-semibold text-gray-800 mb-2">Priority Service</h4>
                  <p className="text-gray-600">Dedicated drivers and expedited pickup for business clients</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-teal-500">
                  <h4 className="font-semibold text-gray-800 mb-2">Event Transportation</h4>
                  <p className="text-gray-600">Coordinated rides for conferences and corporate events</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
                  <h4 className="font-semibold text-gray-800 mb-2">Analytics Dashboard</h4>
                  <p className="text-gray-600">Track usage, spending, and optimize your transport budget</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">How NeuroRide Works</h3>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex-1 text-center mb-8 md:mb-0 px-4">
              <div className="w-20 h-20 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Download the App</h4>
              <p className="text-gray-600">Get our mobile app from your preferred app store and create an account in minutes.</p>
            </div>
            <div className="hidden md:block w-8 h-1 bg-blue-200 flex-grow mx-4"></div>
            <div className="flex-1 text-center mb-8 md:mb-0 px-4">
              <div className="w-20 h-20 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Request a Ride</h4>
              <p className="text-gray-600">Enter your destination, choose your ride type, and confirm your pickup location.</p>
            </div>
            <div className="hidden md:block w-8 h-1 bg-blue-200 flex-grow mx-4"></div>
            <div className="flex-1 text-center px-4">
              <div className="w-20 h-20 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Enjoy Your Journey</h4>
              <p className="text-gray-600">Track your driver in real-time, pay seamlessly, and rate your experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Users Say</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">JD</div>
                <div className="ml-4">
                  <h5 className="font-semibold">John Davis</h5>
                  <div className="flex text-amber-400">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"NeuroRide has completely changed how I commute to work. The drivers are professional and the app is super intuitive!"</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">SM</div>
                <div className="ml-4">
                  <h5 className="font-semibold">Sarah Miller</h5>
                  <div className="flex text-amber-400">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"As a driver, I love the flexibility NeuroRide offers. I can set my own hours and the earnings are competitive!"</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">RJ</div>
                <div className="ml-4">
                  <h5 className="font-semibold">Robert Johnson</h5>
                  <div className="flex text-amber-400">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"The safety features give me peace of mind when my teenage daughter uses the service. The driver tracking and verification are excellent!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;