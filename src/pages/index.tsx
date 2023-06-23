import Container from "~/components/Container";
import Header from "~/components/Header";
import { FiClock, FiFile, FiFilePlus, FiRefreshCcw } from "react-icons/fi";
import { useTokenStore } from "~/lib/store";
import { type ChangeEvent, useRef, useState } from "react";
import { isMigratedUser, TOKEN_REGEX, usernameOrTag } from "~/lib/utils";
import { useRouter } from "next/router";
import BackgroundGrid from "~/components/BackgroundGrid";
import { api } from "~/utils/api";
import DiscordAvatar from "~/components/DiscordAvatar";
import BadgeList from "~/components/BadgeList";

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex h-28 w-full flex-col justify-center rounded border border-gray-700 bg-gray-800 p-5">
      <div className="flex items-center">
        <div className="mr-2 h-16 w-16 animate-pulse rounded-full border border-gray-600 bg-gray-700" />
        <div className="flex flex-col justify-center">
          <div className="mb-2 h-4 w-44 animate-pulse rounded bg-gray-700" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      <div className="ml-auto h-4 w-32 animate-pulse rounded bg-gray-700" />
    </div>
  );
};

export default function Home() {
  const { tokens, addTokens, setTokens } = useTokenStore();
  const router = useRouter();
  const fileUpload = useRef<HTMLInputElement>(null);

  const [pwnedId, setPwnedId] = useState<string>("");
  const { data: pwnedUser, isError } = api.accounts.getPreviewById.useQuery(
    pwnedId,
    {
      retry: false,
      trpc: { abortOnUnmount: true },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      enabled: !!pwnedId && pwnedId.length >= 16,
    }
  );

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
            className="slim-scrollbar w-full resize-none rounded border-2 border-blurple bg-gray-800 p-2 font-mono leading-tight caret-blurple outline-none focus:border-blurple-dark"
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

          <div className="pb-5 pt-14">
            <h2 className="text-xl font-bold">Have I been Pwned?</h2>
            <span className="text-sm text-neutral-300">
              Check whether your own account was queried on this website
            </span>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div className="lg:col-span-2">
                <label className="font-medium" htmlFor="file-type">
                  Discord ID
                </label>
                <span className="block text-sm text-neutral-300">
                  Can be found in your Discord user profile
                </span>
                <input
                  className="mt-2 block w-full rounded border-2 border-blurple bg-gray-800 p-2 font-mono leading-tight caret-blurple outline-none focus:border-blurple-dark"
                  spellCheck={false}
                  placeholder="214772155114717184"
                  onChange={(e) => setPwnedId(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                {pwnedUser && !isError ? (
                  <div className="flex h-28 w-full flex-col rounded border border-gray-700 bg-gray-800 p-5">
                    <div className="flex items-center">
                      <DiscordAvatar user={pwnedUser} />
                      <div className="ml-4 text-left">
                        <div className="flex items-center space-x-2 text-sm">
                          {isMigratedUser(pwnedUser) ? (
                            <span className="font-medium">
                              {usernameOrTag(pwnedUser)}
                            </span>
                          ) : (
                            <div>
                              <span className="font-medium">
                                {pwnedUser.username}
                              </span>
                              <span className="text-xs text-gray-300">
                                #{pwnedUser.discriminator}
                              </span>
                            </div>
                          )}
                          <BadgeList user={pwnedUser} badgeSize={16} />
                        </div>
                        <small className="text-xs text-gray-300">
                          {pwnedUser.id}
                        </small>
                      </div>
                    </div>

                    <div className="inline-flex justify-end gap-2">
                      <div className="inline-flex items-center text-xs">
                        <FiFile className="mr-1" />
                        <span>
                          {pwnedUser._count.tokens}{" "}
                          {pwnedUser._count.tokens > 1 ? "entries" : "entry"}
                        </span>
                      </div>

                      <div className="inline-flex items-center text-xs">
                        <FiClock className="mr-1" />
                        <span>
                          {new Date(pwnedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : !isError ? (
                  <SkeletonCard />
                ) : (
                  <div className="h-28 w-full rounded border border-gray-700 bg-gray-800 p-5">
                    <h3 className="text-lg font-bold">No Account Found</h3>
                    <p className="text-sm text-neutral-300">
                      There are no tokens associated with this account :)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
