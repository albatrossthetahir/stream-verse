import Header from "../../../components/pages/login/Header";
import SignIn from "../../../components/pages/login/page";

export default function login() {
    return (
        <div className="h-[inherit] overflow-auto bg-cover bg-no-repeat bg-center login-bg after:w-full after:h-full after:absolute after:top-0 after:left-0 after:bg-[rgba(0,0,0,0.5)] after:z-10 z-20 flex items-center justify-center">
            <Header/>
            <SignIn/>
        </div>
    )
}
