import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CheckCircle } from "lucide-react";

interface ScheduleTabProps {
  unavailableDates: Date[];
  setUnavailableDates: (dates: Date[]) => void;
}

export const ScheduleTab = ({ unavailableDates, setUnavailableDates }: ScheduleTabProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-purple-600" />
          Atur Ketersediaan
        </CardTitle>
        <CardDescription>Kelola jadwal dan ketersediaan Anda</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="multiple"
          selected={unavailableDates}
          onSelect={setUnavailableDates}
          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
          className="p-0 border rounded-lg"
        />
      </CardContent>
      <div className="p-6 pt-0 flex justify-end">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Simpan Jadwal
        </Button>
      </div>
    </Card>
  );
};