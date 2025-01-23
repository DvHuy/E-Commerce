import { Link } from "react-router";
import logo from "../assets/logo.png";
import Search from "./Search";

const Header = () => {
  return (
    <header className="h-20 shadow-md sticky top-0">
      <div className="container mx-auto px-2 flex items-center h-full justify-between">
        {/* Logo */}
        <div className="h-full">
          <Link to={"/"} className="h-full flex justify-center items-center">
            <img
              src={logo}
              alt="logo"
              width={170}
              height={60}
              className="hidden lg:block"
            />
            <img
              src={logo}
              alt="logo"
              width={120}
              height={60}
              className="lg:hidden"
            />
          </Link>
        </div>
        {/* Search */}
        <div>
          <Search />
        </div>
        {/* Login and my cart */}
        <div>cart</div>
      </div>
    </header>
  );
};

export default Header;
