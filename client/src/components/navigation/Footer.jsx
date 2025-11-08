import logo from "../../assets/SamaKa.png";
import { FaFacebook, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img src={logo} alt="logo" className="w-12 h-12" />
              <h2 className="text-2xl font-bold text-headingText dark:text-white">
                <span className="text-headingText dark:text-white">
                  Bayanimo
                </span>{" "}
                <span className="text-primary"></span>
              </h2>
            </div>
            <div>
              <p className="text-subHeadingText dark:text-gray-300 mb-6"></p>
            </div>
            <div className="flex items-center gap-10">
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 pr-4 hover:text-primary transition-colors"
              >
                Home
              </a>

              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 pr-4 hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 pr-4 hover:text-primary transition-colors"
              >
                Rewards
              </a>
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 pr-4 hover:text-primary transition-colors"
              >
                Join Activity
              </a>
            </div>
            <div className="flex items-center gap-10 mt-4">
              <a
                href="https://www.facebook.com/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                <FaFacebook size={30} />
              </a>
              <a
                href="https://www.linkedin.com/in/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                <FaLinkedin size={30} />
              </a>
              <a
                href="https://x.com/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                <FaTwitter size={30} />
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-headingText dark:text-white mb-6">
              Get in Touch
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-subHeadingText dark:text-gray-300 mb-2"
                  >
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-headingText dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-subHeadingText dark:text-gray-300 mb-2"
                  >
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-headingText dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-subHeadingText dark:text-gray-300 mb-2"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-headingText dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-subHeadingText dark:text-gray-300 mb-2"
                >
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-vertical text-headingText dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-subHeadingText dark:text-gray-300 text-sm">
              © 2025 All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                Terms of Use
              </a>
              <a
                href="#"
                className="text-subHeadingText dark:text-gray-300 hover:text-primary transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
