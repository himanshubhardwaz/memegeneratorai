import { SwitchTransition, CSSTransition } from "react-transition-group";
import { useLocation } from "@remix-run/react";
import { useRef } from "react";
import AnimatedOutlet from "~/components/AnimatedOutlet";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export default function Layout({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const location = useLocation();
  const nodeRef = useRef(null);
  return (
    <>
      <Navbar userId={userId} name={name} />
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          timeout={500}
          nodeRef={nodeRef}
          classNames={{
            enter: "opacity-0",
            enterActive: "opacity-100",
            exitActive: "opacity-0",
          }}
        >
          <div ref={nodeRef} className='transition-all duration-500'>
            <AnimatedOutlet />
          </div>
        </CSSTransition>
      </SwitchTransition>
      <Footer />
    </>
  );
}
