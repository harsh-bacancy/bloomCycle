import { redirect } from "next/navigation";

type LegacyLoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LegacyLoginPage({ searchParams }: LegacyLoginPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.error) {
    query.set("error", params.error);
  }
  if (params.message) {
    query.set("message", params.message);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/login${suffix}`);
}
