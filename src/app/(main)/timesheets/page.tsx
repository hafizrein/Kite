import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"

export default function TimesheetsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheets</CardTitle>
        <CardDescription>
          Submit and approve timesheets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Timesheet content goes here.</p>
        </div>
      </CardContent>
    </Card>
  )
}
