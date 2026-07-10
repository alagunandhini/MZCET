const Footer = () => {
    return (
      <>
        <div className="bg-pink-300/20 py-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Logo and Name */}
            <div className="flex flex-col items-start gap-3">
               
                <div className=" flex gap-2 justify-center items-center">
                <img src="robot.png" alt="Logo" className="h-12 w-12 object-contain" />
                <h1 className="font-bold text-xl text-gray-700">Pinkyy Ai</h1>
                </div>
             
              <p className="leading-relaxed text-gray-600 mb-3"> Upload your resume and get AI-generated HR questions with sample answers. Practice mock interviews, get feedback, and boost your confidence start preparing today!</p>
            </div>
  
            {/* Quick Links */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-700">Quick Links</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">Home</a></li>
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Features</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>
  
            {/* Social Media */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-700">Social Media</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">Instagram</a></li>
                <li><a href="#" className="hover:text-black">LinkedIn</a></li>
                <li><a href="#" className="hover:text-black">Twitter</a></li>
                <li><a href="#" className="hover:text-black">GitHub</a></li>
              </ul>
            </div>
  
            {/* Contact */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-700">Contact Us</h2>
              <p className="text-sm text-gray-600">Email: support@resumeai.com</p>
              <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
              <p className="text-sm text-gray-600">Location: Chennai, India</p>
            </div>
          </div>

          {/* bottom  */}
          <div className="border-t border-gray-400 mt-5 flex items-center justify-center p-0">
            <p className="text-center text-sm mt-10 font-semibold">@2025.All Right Reserved. designed and developed by Alagu nandhini  </p>

          </div>
        </div>
      </>
    );
  };
  
  export default Footer;
  