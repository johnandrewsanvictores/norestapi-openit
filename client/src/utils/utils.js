export const getNavLinkClass = ({ isActive }) =>
  isActive
    ? "text-headingText font-semibold border-b-2 border-primary transition-colors text-lg"
    : "text-subHeadingText hover:text-primary transition-colors text-lg";

export const getSidebarLinkClass = ({ isActive }) =>
  isActive
    ? "flex items-center space-x-2 text-primary font-semibold bg-white rounded-lg px-3 py-2"
    : "flex items-center space-x-2 text-headingText hover:text-primary hover:bg-white rounded-lg px-3 py-2 transition-colors";
