import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";

export default function Settings() {
  return <AdminLayout></AdminLayout>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
