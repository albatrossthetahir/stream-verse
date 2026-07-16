import Link from "next/link";
import Logo from "../../../public/login/Logo";


export default function login() {
    return (
        <header className="p-4 fixed top-0 left-0 w-full z-50">
            <div className="container">
                <Link href={'/'} className="max-w-[148px] block">
                    <Logo />
                </Link>
            </div>
        </header>
    )
}
