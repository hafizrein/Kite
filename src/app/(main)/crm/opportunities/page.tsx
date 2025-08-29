import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function OpportunitiesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Opportunities</CardTitle>
        <Button>New Opportunity</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity Name</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Close Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Project Phoenix</TableCell>
              <TableCell>Innovate Inc.</TableCell>
              <TableCell><Badge>Qualification</Badge></TableCell>
              <TableCell>$150,000</TableCell>
              <TableCell>2024-08-30</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Consulting Gig</TableCell>
              <TableCell>Global Solutions</TableCell>
              <TableCell><Badge variant="destructive">Closed Lost</Badge></TableCell>
              <TableCell>$75,000</TableCell>
              <TableCell>2024-06-01</TableCell>
            </TableRow>
             <TableRow>
              <TableCell className="font-medium">Website Redesign</TableCell>
              <TableCell>Innovate Inc.</TableCell>
              <TableCell><Badge variant="default">Closed Won</Badge></TableCell>
              <TableCell>$50,000</TableCell>
              <TableCell>2024-05-15</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
