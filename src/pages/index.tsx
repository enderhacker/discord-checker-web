import Container from "~/components/Container";
import Header from "~/components/Header";
import { FiFilePlus, FiRefreshCcw } from "react-icons/fi";
import { useTokenStore } from "~/lib/store";
import { type ChangeEvent, useRef } from "react";
import { TOKEN_REGEX } from "~/lib/utils";
import { useRouter } from "next/router";
import BackgroundGrid from "~/components/BackgroundGrid";

export default function Home() {
  const { tokens, addTokens, setTokens } = useTokenStore();
  const router = useRouter();
  const fileUpload = useRef<HTMLInputElement>(null);

  const importFromFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    for (const file of event.target.files) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target || !event.target.result) {
          return;
        }

        const text = event.target.result.toString();
        const matches = text.match(TOKEN_REGEX) || [];

        addTokens(matches);
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    const matches = text.match(TOKEN_REGEX) || [];

    setTokens(matches);
  };

  return (
    <>
      <Header />
      <main>
        <BackgroundGrid />
        <Container className="relative pt-5">
          <div className="justify-between pb-2 md:flex md:items-center">
            <div className="leading-[15px]">
              <h1 className="text-xl font-bold">Token Import</h1>
              <span className="text-sm text-neutral-300">
                You can import as many tokens as you wish
              </span>
            </div>

            <input
              type="file"
              accept="text/*"
              onChange={importFromFile}
              ref={fileUpload}
              className="hidden"
              multiple={true}
            />
            <button
              className="mt-2 rounded bg-blurple p-2 transition duration-150 hover:bg-blurple-dark md:mt-0"
              onClick={() => fileUpload.current && fileUpload.current.click()}
            >
              <FiFilePlus size={20} />
            </button>
          </div>

          <textarea
            className="w-full resize-none rounded border-2 border-blurple bg-gray-800 p-2 font-mono leading-tight caret-blurple outline-none focus:border-blurple-dark"
            spellCheck={false}
            placeholder={"Paste your tokens here, one per line."}
            rows={15}
            value={tokens.join("\n")}
            onChange={handleInputChange}
          />

          <div className="flex items-center justify-between">
            <button
              className="flex items-center rounded bg-blurple px-2 py-1.5 font-medium transition duration-150 hover:bg-blurple-dark disabled:opacity-50"
              disabled={tokens.length === 0}
              onClick={() => void router.push("/check")}
            >
              <FiRefreshCcw size={20} className="mr-2" />
              Check Tokens
            </button>

            <span className="text-sm">
              <b>{tokens.length}</b> Tokens to Check
            </span>
          </div>
        </Container>
      </main>
    </>
  );
}
