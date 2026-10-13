import Link from "next/link";
import Logo from "@/components/Logo";
import { Reveal, TemplateNote } from "@/components/ui";
import { policies, policyList, type PolicyDoc } from "@/lib/policies";
import { site } from "@/lib/config";

export default function PolicyPage({ docKey }: { docKey: keyof typeof policies }) {
  const doc: PolicyDoc = policies[docKey];

  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="shell max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-start">
          <article>
            <p className="eyebrow text-gold-deep">{site.brand} · legal</p>
            <h1 className="mt-4 text-[clamp(2.1rem,4.6vw,3rem)] leading-tight text-charcoal">{doc.title}</h1>
            <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-charcoal/65">{doc.intro}</p>

            <div className="mt-8">
              <TemplateNote>
                This is an editable working template held in <code>src/lib/policies.ts</code>. Replace it with your
                registered business terms — we have not invented a return window, warranty period, GSTIN, address or
                grievance officer.
              </TemplateNote>
            </div>

            <div className="mt-10 space-y-9">
              {doc.sections.map((s, i) => (
                <Reveal key={s.heading} as="section" delay={Math.min(0.12, i * 0.02)}>
                  <h2 className="flex items-baseline gap-3 text-[1.28rem] text-charcoal">
                    <span className="font-sans text-[0.68rem] font-semibold tabular-nums text-gold-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 border-l border-charcoal/10 pl-5 text-[0.95rem] leading-relaxed text-charcoal/70">
                    {s.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-charcoal/10 pt-7">
              <Link href="/contact" className="btn btn-ink px-5 py-2.5 text-[0.64rem]">
                Ask about this policy
              </Link>
              <Link href="/faq" className="btn btn-outline px-5 py-2.5 text-[0.64rem]">
                Read the FAQ
              </Link>
              <Link href="/" className="btn btn-outline px-5 py-2.5 text-[0.64rem]">
                Back to the store
              </Link>
            </div>
          </article>

          <aside className="lg:sticky lg:top-28">
            <div className="card p-5">
              <Logo variant="dark" size="sm" withLink={false} />
              <nav aria-label="Policies" className="mt-5 space-y-1">
                {policyList.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={p.href === `/${doc.slug}` ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2 text-[0.82rem] transition-colors ${
                      p.href === `/${doc.slug}` ? "bg-gold/12 font-semibold text-charcoal" : "text-charcoal/60 hover:bg-charcoal/[0.04] hover:text-charcoal"
                    }`}
                  >
                    {p.title}
                  </Link>
                ))}
              </nav>
              <div className="mt-5 border-t border-charcoal/8 pt-4 text-[0.76rem] leading-relaxed text-charcoal/55">
                <p className="font-semibold text-charcoal/70">Need a human?</p>
                <p className="mt-1">{site.support.email}</p>
                <p>{site.support.hours}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
