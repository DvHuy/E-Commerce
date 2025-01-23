import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { TypeAnimation } from "react-type-animation";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  useEffect(() => {
    const isSearchPage = location.pathname === "/search";
    setIsSearchPage(isSearchPage);
  }, [location]);
  const redirectToSearchPage = () => {
    navigate("/search");
  };
  return (
    <div className="flex items-center w-full min-w-[300px] lg:min-w-[420px] h-12 rounded-lg border overflow-hidden text-neutral-500 bg-slate-50">
      <button className="flex justify-center items-center h-full p-3 ">
        <FaSearch size={22} />
      </button>
      <div className="w-full h-full">
        {!isSearchPage ? (
          //when not in search page
          <div onClick={redirectToSearchPage} className="w-full h-full flex items-center">
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed once, initially
                'Search "milk"',
                1000,
                'Search "rice"',
                1000,
                'Search "sugar"',
                1000,
                'Search "panner"',
                1000,
                'Search "chocolate"',
                1000,
              ]}
              speed={50}
              wrapper="span"
              repeat={Infinity}
            />
          </div>
        ) : (
          //when i was search page
          <div className="w-full h-full">
            <input
              type="text"
              placeholder="Search for atta dal and more."
              autoFocus={true}
              className="bg-transparent w-full h-full outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
