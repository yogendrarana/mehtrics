import Image from "next/image";
import SiteLogo from "../assets/logo2.png";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="cursor-pointer">
      <Image src={SiteLogo} alt="Mehtrics Logo" width={100} />
    </Link>
  );
}
