import Image from "next/image";
import { HiOutlineBell, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { PiBellSimpleFill } from "react-icons/pi";

export default function Navbar() {
  return (
    <div className="bg-black px-6 py-4 flex items-center gap-8">
      {/* Logo */}
      <Image
        src="/images/Logo.svg"
        alt="OPNODE LOGO"
        width={364}
        height={43.07}
        className="w-auto h-10"
      />

      {/* Search Bar + Actions */}
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#131313] text-gray-200 rounded-full px-6 py-3 border border-[#2A2828] focus:outline-none focus:border-gray-800 placeholder:text-[#ACACAC]"
          />
        </div>

        <button
          className="bg-[#51525C] w-12 h-12 hover:bg-gray-600 rounded-full flex justify-center items-center transition-colors"
          aria-label="Search"
        >
          <HiOutlineMagnifyingGlass className="w-[21px] h-[21px] text-white" />
        </button>

        <button
          className="bg-[#51525C] w-12 h-12 hover:bg-gray-600 rounded-full flex justify-center items-center transition-colors"
          aria-label="Notifications"
        >
          <PiBellSimpleFill className="w-[21px] h-[21px] text-white" />
        </button>

        <div className="relative w-12 h-12">
          <Image
            src="/images/profile.png"
            alt="profile"
            fill
            sizes="50px"
            className="rounded-full object-cover border border-[#2A2828]"
          />
        </div>
      </div>
    </div>
  );
}
