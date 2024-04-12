import Image from "next/image";
import styles from "../app/page.module.css";
import Header from '../app/Header';
import '../app/globals.css';
export default function Home() {
  return (
    <main className={styles.main}>
    <Header />
     <div className="operations">
        Test
     </div>
    </main>
  );
}
