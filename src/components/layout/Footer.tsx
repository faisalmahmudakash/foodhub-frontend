import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { BsInstagram } from "react-icons/bs";

const aboutLinks = [
  "Fredoka One",
  "Special Dish",
  "Reservation",
  "Blog",
  "Contact",
];
const menuLinks = ["Steaks", "Burgers", "Coctails", "Bar B Q", "Desserts"];

const contactItems = [
  {
    icon: MapPin,
    content: <>Uttara, Dhaka</>,
  },
  { icon: Phone, content: "+88 01729-xxxxxx" },
  { icon: Mail, content: "info@foodio.com" },
  { icon: Clock, content: "10 AM - 11 PM" },
];

const socialLinks = [
  { icon: FaFacebookF, label: "Facebook", href: "#" },
  { icon: BsInstagram, label: "Instagram", href: "#" },
  { icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#ccc] px-6 pt-12 pb-0 sm:px-10 sm:pt-14 lg:px-20">
      {/* Top grid: 1 col mobile -> 2 col tablet -> 4 col desktop */}
      <div className="grid grid-cols-1 gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-4.5 text-[2rem] font-extrabold text-white">
            Your Logo
          </div>
          <p className="mb-7 text-[0.88rem] leading-[1.7] text-[#9ca3af]">
            Proudly serving delicious food and warm hospitality since [2022].
            Whether it&apos;s a quick bite or a special celebration, we&apos;re
            here with great taste and friendly service — always.
          </p>
          <div className="flex items-center gap-3.5">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* About Us */}
        <div>
          <h4 className="mb-5.5 text-base font-bold text-white">About Us</h4>
          <ul className="flex flex-col gap-3.25">
            {aboutLinks.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-[0.88rem] text-[#9ca3af] transition-colors hover:text-white"
                >
                  <span className="text-[#6b7280]">&rsaquo;</span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu */}
        <div>
          <h4 className="mb-5.5 text-base font-bold text-white">Menu</h4>
          <ul className="flex flex-col gap-3.25">
            {menuLinks.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-[0.88rem] text-[#9ca3af] transition-colors hover:text-white"
                >
                  <span className="text-[#6b7280]">&rsaquo;</span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="mb-5.5 text-base font-bold text-white">Contact Us</h4>
          <ul className="flex flex-col gap-4">
            {contactItems.map(({ icon: Icon, content }, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[0.88rem] text-[#9ca3af]"
              >
                <span className="-mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-md bg-[#1e293b]">
                  <Icon size={15} className="text-[#6b7280]" />
                </span>
                <span>{content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="m-0 border-t border-[#1e293b]" />

      {/* Bottom bar: stacked on mobile, row on larger screens */}
      <div className="flex flex-col items-center gap-4 py-5 text-center text-[0.82rem] text-[#6b7280] sm:flex-row sm:justify-between sm:gap-3 sm:text-left">
        <span>@ 2025 Your Brand. All Right Reserved.</span>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a
            href="#"
            className="text-[#9ca3af] transition-colors hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-[#9ca3af] transition-colors hover:text-white"
          >
            Teams of service
          </a>
          <a
            href="#"
            className="text-[#9ca3af] transition-colors hover:text-white"
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
