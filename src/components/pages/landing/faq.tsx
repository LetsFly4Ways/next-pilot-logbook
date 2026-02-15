"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "Why NEXT Pilot Logbook?",
      answer: (
        <>
          There are hundreds of options on the web, all with their advantages and disadvantages.
          We build this logbook as an open-source alternative to paid subscriptions.
          This being said, you should choose the logbook which fits best for you — on paper,
          Excel, all-in-one cloud logbooks, or open-source self-hosting. It all depends on what you want.
        </>
      )
    },
    {
      question: "Is NEXT compliant with regulations?",
      answer: (
        <>
          Yes. Our logging formats and digital exports are designed to follow{" "}
          <a
            href="https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-aircrew-regulation-eu-no?page=5#_Toc512863430"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-medium"
          >
            EASA Aircrew Regulation (EU) No 1178/2011
          </a>{" "}
          standards for pilot flight crew licensing.
        </>
      )
    },
    {
      question: "Can I create an account and get started now?",
      answer: "We are currently in active development to ensure the highest level of stability. At this stage, access is restricted to invite-only users as we cannot guarantee data security at the moment."
    },
    {
      question: "How can it be 'free'?",
      answer: "As an open-source project, NEXT is designed to be deployed by you. In a coming release, we will provide a step-by-step guide on how to set up and deploy your own instance for self-hosting at no cost, ensuring your logbook remains yours forever."
    },
    {
      question: "Does it work without an internet connection?",
      answer: (
        <>
          Currently, the app requires a connection as it relies on{" "}
          <a
            href="https://supabase.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-medium"
          >
            Supabase
          </a>{" "}
          for secure data storage. However, we understand the importance of cockpit accessibility; offline support is a high priority on our development roadmap.
        </>
      )
    },
    {
      question: "Which features are coming in the next versions?",
      answer: (
        <>
          You can track our development progress{" "}
          <a
            href="https://github.com/LetsFly4Ways/next-pilot-logbook/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-medium"
          >
            Project Releases
          </a>{" "}
          or contribute to the source code on{" "}
          <a
            href="https://github.com/LetsFly4Ways/next-pilot-logbook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-medium"
          >
            GitHub
          </a>.
        </>
      )
    }
  ];

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container max-w-3xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
          <p className="text-muted-foreground mt-2">Common questions about the logbook.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-muted transition-all duration-200">
              <AccordionTrigger className="text-left text-lg font-medium hover:no-underline hover:text-secondary py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}