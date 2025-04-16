
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Check } from "lucide-react";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Here we would normally redirect after signup
      console.log("Signup attempt with:", { name, email, password });
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-clay-lavender/10">
        <div className="w-full max-w-md">
          <div className="clay-panel">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-gray-600 mt-2">Start managing your subdomains today</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="clay-input"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="clay-input"
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="clay-input"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the{" "}
                    <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              
              <Button
                type="submit"
                className="clay-button-primary w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our terms of service and privacy policy.
              </p>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="clay-button bg-white text-gray-700 py-2 px-4 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.818h5.556c-.23 1.438-.916 2.658-1.952 3.478l3.142 2.439c1.838-1.697 2.903-4.194 2.903-7.151 0-.609-.054-1.196-.155-1.765h-9.494z" />
                      <path d="M5.61 14.257l-2.765 2.15c1.754 3.459 5.37 5.835 9.526 5.835 2.871 0 5.272-.936 7.03-2.538l-3.142-2.439c-.875.586-1.994.935-3.888.935-2.984 0-5.518-2.015-6.427-4.724h-4.067z" />
                      <path d="M19.834 10.121c.167-.543.266-1.121.266-1.72 0-.599-.099-1.177-.266-1.72H5.61v3.44h10.097z" />
                      <path d="M5.61 6.681c-.909-2.709-3.443-4.724-6.427-4.724-4.156 0-7.772 2.376-9.526 5.835l2.765 2.15h4.067z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="clay-button bg-white text-gray-700 py-2 px-4 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-5.992-4.81-10.802-10.802-10.802S2.396 6.081 2.396 12.073c0 5.402 3.874 9.889 9.002 10.622v-7.521H8.08v-3.101h3.318V9.412c0-3.28 1.952-5.087 4.935-5.087 1.429 0 2.926.255 2.926.255v3.219h-1.649c-1.622 0-2.131 1.01-2.131 2.044v2.458h3.63l-.58 3.101h-3.05v7.521c5.127-.733 9.002-5.22 9.002-10.622z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefit Box */}
          <div className="mt-8 clay-card bg-clay-mint/70">
            <h3 className="font-semibold text-lg mb-3">What you'll get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Easy subdomain registration and management</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Automatic SSL certificates for all your domains</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>User-friendly dashboard to monitor performance</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>24/7 support from our expert team</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
