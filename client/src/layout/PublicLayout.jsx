import Nav from "../components/navigation/Nav.jsx";
import Footer from "../components/navigation/Footer.jsx";

export default function PublicLayout({ children }) {
    return (
        <>
            <Nav/>
            {children}
            <Footer/>
        </>
    );
}