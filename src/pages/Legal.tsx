import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, AlertTriangle, Clock } from "lucide-react";

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-foreground"
      style={{ background: 'linear-gradient(180deg, hsl(25 30% 12%) 0%, hsl(25 25% 8%) 100%)' }}
    >
      {/* Header */}
      <header
        className="border-b-2 border-brass-border/50 leather-card backdrop-blur-sm sticky top-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" style={{ color: 'hsl(38 60% 45%)' }} />
            <h1 className="text-xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
              Legal & Content Policy
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-10">

          {/* Intro */}
          <section className="parchment-card p-6">
            <p className="font-body text-card-foreground leading-relaxed">
              Trove is an archiving platform that allows users to inscribe historical and public-domain documents onto the Bitcoin SV blockchain. Because blockchain inscriptions are <strong>permanent and immutable</strong>, we take content responsibility seriously. This page explains our content policy, how to report a problem, and how we handle takedown requests.
            </p>
          </section>

          {/* What cannot be uploaded */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(38 60% 45%)' }} />
              <h2 className="text-xl font-display font-bold text-primary">Prohibited Content</h2>
            </div>
            <div className="parchment-card p-6 space-y-3 font-body text-card-foreground">
              <p>The following content may <strong>not</strong> be uploaded to Trove under any circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Illegal content of any kind, including CSAM</li>
                <li>Personal data of living individuals without their explicit consent (UK GDPR Article 6)</li>
                <li>Special category personal data (health, biometric, financial records) of any individual</li>
                <li>Documents classified under the Official Secrets Act or equivalent legislation</li>
                <li>Content that is defamatory of an identifiable living person</li>
                <li>Material to which you do not hold the rights, or that is not in the public domain</li>
                <li>Documents dated after the year 2000 unless you are the original author or rights holder</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Every upload requires an explicit legal declaration. Uploading prohibited content may result in your account being suspended and the document being delisted from the Trove index. It will not be removed from the BSV blockchain.
              </p>
            </div>
          </section>

          {/* Blockchain permanence note */}
          <section>
            <h2 className="text-xl font-display font-bold text-primary mb-4">The Blockchain Permanence Note</h2>
            <div className="parchment-card p-6 font-body text-card-foreground">
              <p className="leading-relaxed">
                Trove is an <strong>indexing and display layer</strong> built on top of the BSV blockchain. When a document is inscribed, it is written to the blockchain by the user — Trove does not control the blockchain and cannot delete content from it.
              </p>
              <p className="leading-relaxed mt-3">
                What Trove <strong>can</strong> do is remove content from its index and stop displaying it in the application. A delisted document is no longer searchable, browsable, or monetised through Trove, but the underlying blockchain record remains.
              </p>
              <p className="leading-relaxed mt-3">
                This is equivalent to Google removing a URL from search results: the page still exists, but Google no longer surfaces it.
              </p>
            </div>
          </section>

          {/* Copyright / DMCA */}
          <section>
            <h2 className="text-xl font-display font-bold text-primary mb-4">Copyright & Takedown (DMCA / CDPA)</h2>
            <div className="parchment-card p-6 font-body text-card-foreground space-y-3">
              <p>
                Trove operates under the safe harbour provisions of the <strong>UK Copyright, Designs and Patents Act 1988</strong> and the <strong>US Digital Millennium Copyright Act</strong>. If you believe content displayed on Trove infringes your copyright, you may submit a takedown notice.
              </p>
              <p className="font-bold">A valid notice must include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your full name and contact details</li>
                <li>Identification of the copyrighted work you claim is being infringed</li>
                <li>The URL or document ID of the allegedly infringing content on Trove</li>
                <li>A statement that you have a good faith belief the use is not authorised</li>
                <li>A statement that the information is accurate and, under penalty of perjury, that you are the rights holder or authorised to act on their behalf</li>
                <li>Your electronic or physical signature</li>
              </ul>
              <p className="mt-3">
                Send notices to: <strong>legal@curiosities.app</strong> — subject line: <em>DMCA Takedown Notice</em>
              </p>
              <p className="text-sm text-muted-foreground">
                We aim to respond within 48 hours and will delist the content promptly upon receipt of a valid notice.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-xl font-display font-bold text-primary mb-4">Privacy & UK GDPR</h2>
            <div className="parchment-card p-6 font-body text-card-foreground">
              <p className="leading-relaxed">
                Trove is committed to compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We collect only the data necessary to operate the platform. We do not sell personal data to third parties.
              </p>
              <p className="leading-relaxed mt-3">
                If you believe a document displayed on Trove contains your personal data without your consent, please contact <strong>legal@curiosities.app</strong> with the subject line <em>GDPR Data Subject Request</em>. We will investigate and delist the content within 72 hours where warranted.
              </p>
            </div>
          </section>

          {/* Response times */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" style={{ color: 'hsl(38 60% 45%)' }} />
              <h2 className="text-xl font-display font-bold text-primary">Response Commitments</h2>
            </div>
            <div className="parchment-card p-6 font-body text-card-foreground">
              <ul className="space-y-2">
                <li><span className="font-bold">Copyright takedown:</span> Response within 48 hours, delist within 24 hours of valid notice</li>
                <li><span className="font-bold">GDPR data subject request:</span> Response within 72 hours</li>
                <li><span className="font-bold">Illegal content report:</span> Immediate delist on confirmation, escalation to relevant authorities</li>
                <li><span className="font-bold">General enquiries:</span> Response within 5 business days</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5" style={{ color: 'hsl(38 60% 45%)' }} />
              <h2 className="text-xl font-display font-bold text-primary">Contact</h2>
            </div>
            <div className="parchment-card p-6 font-body text-card-foreground">
              <p>
                All legal correspondence, takedown notices, and content reports should be sent to:
              </p>
              <p className="mt-3 text-lg font-bold" style={{ color: 'hsl(42 88% 55%)' }}>
                legal@curiosities.app
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {/* TODO: Add registered company name and address once incorporated */}
                Trove — registered in England and Wales
              </p>
            </div>
          </section>

          <p className="text-xs text-muted-foreground font-body text-center">
            Last updated: March 2026 · This policy may be updated periodically
          </p>
        </div>
      </main>
    </div>
  );
};

export default Legal;
