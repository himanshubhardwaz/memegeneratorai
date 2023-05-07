import { useLocation, useOutlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

import { AnimatePresence, motion } from "framer-motion";

export default function Layout({
  userId,
  name,
  isEmailVerified,
}: {
  userId: string;
  name: string;
  isEmailVerified: boolean;
}) {
  const outlet = useOutlet();

  return (
    <div>
      <Navbar userId={userId} name={name} />
      <AnimatePresence mode='wait' initial={false}>
        <motion.main
          key={useLocation().pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
