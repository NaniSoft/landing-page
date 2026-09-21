// Typography/DisplayTitle ride the site's client boundary (components/prism-client.tsx).
import { DisplayTitle, Paragraph, Text } from '@/components/prism-client';

export default function HomePage() {
  return (
    <section className="placeholder-hero">
      <Text className="placeholder-kicker" type="secondary">
        NaniSoft · scaffold placeholder
      </Text>
      <DisplayTitle>NaniSoft</DisplayTitle>
      <Paragraph className="placeholder-lede">Software that builds software.</Paragraph>
      <Text type="secondary">
        Placeholder deploy — the real landing, docs, and blog land with this site&rsquo;s build ticket.
      </Text>
    </section>
  );
}
