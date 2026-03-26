import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="cursor-pointer">
      <Image
        src="/images/logo.png"
        alt="Mehtrics Logo"
        width={100}
        height={100}
      />
    </Link>
  );
}
