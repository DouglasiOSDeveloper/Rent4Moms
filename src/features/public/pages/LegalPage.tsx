import React, { useEffect, useMemo, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import type { PublicLegalPage } from "../../../domain/content/types";
import { loadPublicLegalPage } from "../../../services/content/contentApi";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";

function LegalContent({ content }: { content: string }) {
  const blocks = useMemo(() => content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean), [content]);
  return (
    <div className="space-y-5 text-muted-foreground leading-relaxed">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) return <h2 key={`${block}-${index}`} className="text-xl font-semibold text-foreground pt-4">{block.slice(3)}</h2>;
        if (block.startsWith("# ")) return <h1 key={`${block}-${index}`} style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground">{block.slice(2)}</h1>;
        if (block.split("\n").every((line) => line.startsWith("- "))) {
          return (
            <ul key={`${block}-${index}`} className="list-disc pl-6 space-y-2">
              {block.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={`${block}-${index}`}>{block}</p>;
      })}
    </div>
  );
}

export function LegalPage({ slug }: { slug: string }) {
  const { legalPages } = useSiteContent();
  const cached = legalPages.find((page) => page.slug === slug) ?? null;
  const [page, setPage] = useState<PublicLegalPage | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(!cached);
    setError("");
    loadPublicLegalPage(slug)
      .then((result) => { if (active) setPage(result); })
      .catch(() => { if (active && !cached) setError("Esta página ainda não está disponível."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cached, slug]);

  if (loading && !page) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground"><LoaderCircle className="animate-spin mx-auto mb-3" />Carregando conteúdo...</div>;
  }

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <FileText size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Conteúdo indisponível</h1>
        <p className="text-muted-foreground">{error || "Esta página ainda não foi publicada."}</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 pb-6 border-b border-border">
        <p className="text-sm text-primary font-medium mb-2">Documento legal · versão {page.version}</p>
        <p className="text-muted-foreground">{page.summary}</p>
        <p className="text-xs text-muted-foreground mt-3">Publicado em {new Date(page.publishedAt).toLocaleDateString("pt-BR")}</p>
      </div>
      <LegalContent content={page.content} />
    </article>
  );
}
