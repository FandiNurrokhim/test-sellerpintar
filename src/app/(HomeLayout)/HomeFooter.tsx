import Image from "next/image";
import LogoIpsumWhite from "../../../public/images/logos/LogoIpsumWhite.png";

export default function Footer() {
  return (
    <footer className="w-full h-[100px] bg-[#2563EBDB] py-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Image
          src={LogoIpsumWhite}
          alt="Logo"
          width={133}
          height={24}
        />
        <span className="text-white text-base !font-archivo">
          © 2025 Blog genzet. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
