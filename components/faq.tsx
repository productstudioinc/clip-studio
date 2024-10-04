'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

const faqs = [
  {
    section: 'General',
    qa: [
      {
        question: 'What is Clip Studio?',
        answer: (
          <span>Clip Studio is a tool to create AI generated videos.</span>
        )
      },
      {
        question: 'How does Clip Studio work?',
        answer: (
          <span>
            Simply enter your prompt and the video will be generated in minutes.
          </span>
        )
      }
    ]
  },
  {
    section: 'Support',
    qa: [
      {
        question: 'Do you offer technical support?',
        answer: (
          <span>
            Clip Studio is a <strong>self-serve</strong> product. We do not
            offer technical support. However, if you have a bug to report,
            please send us an email at{' '}
            <a href="mailto:support@clip.studio" className="underline">
              support@clip.studio
            </a>{' '}
            and we will fix it as soon as possible.
          </span>
        )
      }
    ]
  }
]

const Faq = () => {
  return (
    <section id="faqs">
      <h2 className="mb-4 text-center text-5xl font-bold tracking-tight text-foreground container py-14">
        Frequently Asked Questions
      </h2>
      <h4 className="mb-8 text-center text-lg font-medium tracking-tight text-foreground/80">
        Need help with something? Here are some of the most common questions we
        get.
      </h4>
      <div className="container mx-auto my-12 max-w-[600px] space-y-12">
        {faqs.map((faq, idx) => (
          <section key={idx} id={'faq-' + faq.section}>
            <h2 className="mb-4 text-left text-base font-semibold tracking-tight text-foreground/60">
              {faq.section}
            </h2>
            <Accordion
              type="single"
              collapsible
              className="flex w-full flex-col items-center justify-center"
            >
              {faq.qa.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={faq.question}
                  className="w-full max-w-[600px]"
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
      <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
        Still have questions? Email us at{' '}
        <a href="mailto:support@clip.studio" className="underline">
          support@clip.studio
        </a>
      </h4>
    </section>
  )
}

export default Faq
