import { For } from "solid-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn-solid/tailwind/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shadcn-solid/tailwind/ui/tabs"

const tabs = [
  {
    value: "overview",
    title: "Overview",
    description:
      "View your key metrics and recent project activity. Track progress across all your active projects.",
    content: "You have 12 active projects and 3 pending tasks.",
  },
  {
    value: "analytics",
    title: "Analytics",
    description:
      "Track performance and user engagement metrics. Monitor trends and identify growth opportunities.",
    content: "Page views are up 25% compared to last month.",
  },
  {
    value: "reports",
    title: "Reports",
    description: "Generate and download your detailed reports. Export data in multiple formats for analysis.",
    content: "You have 5 reports ready and available to export.",
  },
  {
    value: "settings",
    title: "Settings",
    description: "Manage your account preferences and options. Customize your experience to fit your needs.",
    content: "Configure notifications, security, and themes.",
  },
]

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" class="w-[400px]">
      <TabsList>
        <For each={tabs}>{(tab) => <TabsTrigger value={tab.value}>{tab.title}</TabsTrigger>}</For>
      </TabsList>
      <For each={tabs}>
        {(tab) => (
          <TabsContent value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle>{tab.title}</CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <CardContent class="text-sm text-muted-foreground">{tab.content}</CardContent>
            </Card>
          </TabsContent>
        )}
      </For>
    </Tabs>
  )
}
