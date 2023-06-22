import Container from "~/components/Container";
import Link from "next/link";
import { SiDiscord, SiGithub } from "react-icons/si";

const Header: React.FC = () => {
  return (
    <header className="py-5">
      <Container className="flex items-center">
        <SiDiscord size={48} className="mr-4 mt-1" />
        <div className="flex flex-col">
          <Link href="/" className="text-2xl font-bold">
            Discord Token Checker
          </Link>
          <span className="-mt-1 text-xs text-neutral-200">by masterjanic</span>
        </div>
        <Link
          target="_blank"
          href="https://github.com/masterjanic/discord-checker-web"
          className="ml-auto mt-1 transition duration-150 hover:text-neutral-300"
        >
          <SiGithub size={24} />
        </Link>
      </Container>
    </header>
  );
};

export default Header;
