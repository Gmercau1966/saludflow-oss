import type { Metadata } from "next";
import { CaseDetailWorkspace } from "@/components/demo/CaseDetailWorkspace";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Expediente",
};

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        <CaseDetailWorkspace caseId={id} />
      </main>
      <Footer />
    </div>
  );
}
