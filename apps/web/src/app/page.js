import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="space-y-12">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Queen City Media</h1>
        <p className="text-lg opacity-80 mb-6">
          AI-powered marketing & media systems for growing businesses.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg">Get Started</Button>
          <a
            href="/offers"
            className="inline-block px-5 py-2 rounded-lg border shadow-sm bg-white hover:bg-gray-50"
          >
            View Offers
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Content Systems</h2>
            <p className="text-sm opacity-80">
              Automated social content pipelines to keep your brand visible.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Lead Generation</h2>
            <p className="text-sm opacity-80">
              Data-driven outreach to keep your sales pipeline full.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Automation</h2>
            <p className="text-sm opacity-80">
              Custom AI + workflow automation for efficiency at scale.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
