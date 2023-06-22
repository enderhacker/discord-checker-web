import Image from "next/image";
import { type APIUser } from "discord-api-types/v10";
import { BADGE_FLAGS, hasFlag, toTitleCase } from "~/lib/utils";
import Tooltip from "~/components/Tooltip";

type BadgeListProps = {
  badgeSize?: number;
  user: APIUser;
};

const BadgeList: React.FC<BadgeListProps> = ({ badgeSize = 16, user }) => {
  return (
    <div className="flex items-center space-x-1">
      {user.flags
        ? Object.keys(BADGE_FLAGS)
            .filter((bit) => hasFlag(user, bit))
            .map((flag) => (
              <Tooltip text={toTitleCase(flag)} key={`f-${flag}-${user.id}`}>
                <Image
                  src={`/images/badges/${flag.toLowerCase()}.svg`}
                  alt={toTitleCase(flag)}
                  width={badgeSize}
                  height={badgeSize}
                  className={"h-4 w-full"}
                />
              </Tooltip>
            ))
        : null}

      {user.premium_type && user.premium_type > 0 ? (
        <Tooltip
          text={
            ["Nitro Classic", "Nitro Full", "Nitro Basic"][
              user.premium_type - 1
            ] || "Unknown"
          }
        >
          <Image
            src={`/images/badges/nitro.svg`}
            alt="Discord Nitro"
            width={badgeSize}
            height={badgeSize}
            className="h-4 w-full"
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default BadgeList;
