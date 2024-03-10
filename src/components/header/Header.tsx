import { colors } from "@/styles/theme";
import React from "react";
import { CreationFormModal } from "../home/CreationFormModal";

export const Header = () => {
  return (
    <header
      className="fixed top-0 w-full text-white shadow-md z-10"
      style={{
        background: "#334155",
        padding: "20px 0",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div style={{ maxWidth: "1920px", margin: "0 auto" }}>
        <nav>
          <div
            className="flex justify-between items-center"
            style={{ paddingLeft: "40px", paddingRight: "40px" }}
          >
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Coconut.
            </h1>

            <CreationFormModal />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
