import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import AdminLayout from "~/layouts/AdminLayout";

export default function Users() {
  return (
    <AdminLayout>
      <div className="pb-5 leading-[15px]">
        <h1 className="text-3xl font-bold">User Management</h1>
        <span className="text-neutral-300">
          Manage which users can access the admin panel
        </span>
      </div>
    </AdminLayout>
  );
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
