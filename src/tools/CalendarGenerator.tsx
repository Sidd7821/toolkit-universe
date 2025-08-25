import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Calendar, Settings, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarSettings {
  year: number;
  month: number;
  startDay: 'sunday' | 'monday';
  showWeekNumbers: boolean;
  showHolidays: boolean;
  theme: 'default' | 'minimal' | 'colorful' | 'professional';
  size: 'a4' | 'letter' | 'a3';
  orientation: 'portrait' | 'landscape';
}

interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'religious' | 'observance';
}

const CalendarGenerator = () => {
  const { toast } = useToast();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState<CalendarSettings>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startDay: 'sunday',
    showWeekNumbers: false,
    showHolidays: true,
    theme: 'default',
    size: 'a4',
    orientation: 'portrait'
  });

  const [showPreview, setShowPreview] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekMonday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const themes = {
    default: {
      primary: '#3b82f6',
      secondary: '#f1f5f9',
      text: '#1e293b',
      border: '#e2e8f0'
    },
    minimal: {
      primary: '#64748b',
      secondary: '#ffffff',
      text: '#334155',
      border: '#f1f5f9'
    },
    colorful: {
      primary: '#ec4899',
      secondary: '#fdf2f8',
      text: '#581c87',
      border: '#f3e8ff'
    },
    professional: {
      primary: '#059669',
      secondary: '#f0fdf4',
      text: '#064e3b',
      border: '#dcfce7'
    }
  };

  const sizes = {
    a4: { width: '210mm', height: '297mm' },
    letter: { width: '8.5in', height: '11in' },
    a3: { width: '297mm', height: '420mm' }
  };

  const holidays: Holiday[] = [
    { date: '01-01', name: 'New Year\'s Day', type: 'national' },
    { date: '02-14', name: 'Valentine\'s Day', type: 'observance' },
    { date: '03-17', name: 'St. Patrick\'s Day', type: 'religious' },
    { date: '04-01', name: 'April Fools\' Day', type: 'observance' },
    { date: '05-05', name: 'Cinco de Mayo', type: 'observance' },
    { date: '07-04', name: 'Independence Day', type: 'national' },
    { date: '10-31', name: 'Halloween', type: 'observance' },
    { date: '11-11', name: 'Veterans Day', type: 'national' },
    { date: '12-25', name: 'Christmas', type: 'religious' }
  ];

  const handleSettingChange = (field: keyof CalendarSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    return settings.startDay === 'monday' ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
  };

  const isHoliday = (day: number, month: number) => {
    const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return holidays.find(holiday => holiday.date === dateStr);
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(settings.year, settings.month);
    const firstDay = getFirstDayOfMonth(settings.year, settings.month);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const downloadCalendar = () => {
    if (!calendarRef.current) return;
    
    toast({
      title: "Download Feature",
      description: "Calendar download feature will be implemented with html2canvas integration.",
    });
  };

  const getCalendarStyles = () => {
    const theme = themes[settings.theme];
    const size = sizes[settings.size];
    
    return {
      width: size.width,
      height: size.height,
      backgroundColor: theme.secondary,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      fontFamily: 'Inter, system-ui, sans-serif'
    };
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();
    const theme = themes[settings.theme];
    const currentDaysOfWeek = settings.startDay === 'monday' ? daysOfWeekMonday : daysOfWeek;
    
    return (
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>
            {months[settings.month - 1]} {settings.year}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (settings.month === 1) {
                  handleSettingChange('year', settings.year - 1);
                  handleSettingChange('month', 12);
                } else {
                  handleSettingChange('month', settings.month - 1);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{settings.year}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (settings.month === 12) {
                  handleSettingChange('year', settings.year + 1);
                  handleSettingChange('month', 1);
                } else {
                  handleSettingChange('month', settings.month + 1);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {currentDaysOfWeek.map((day, index) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-sm"
              style={{ 
                backgroundColor: theme.primary, 
                color: 'white',
                borderRadius: '8px 8px 0 0'
              }}
            >
              {day}
            </div>
          ))}
          
          {/* Week numbers column */}
          {settings.showWeekNumbers && (
            <div className="col-span-1">
              {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                <div
                  key={weekIndex}
                  className="p-3 text-center text-xs font-medium border-r"
                  style={{ 
                    backgroundColor: theme.secondary,
                    color: theme.text,
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {weekIndex + 1}
                </div>
              ))}
            </div>
          )}

          {/* Calendar days */}
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="p-3 text-center border"
                  style={{ 
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    height: '60px'
                  }}
                />
              );
            }

            const holiday = isHoliday(day, settings.month);
            const isToday = day === new Date().getDate() && 
                           settings.month === new Date().getMonth() + 1 && 
                           settings.year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`p-2 text-center border relative ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ 
                  backgroundColor: theme.secondary,
                  borderColor: theme.border,
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                  {day}
                </span>
                {holiday && (
                  <div className="text-xs mt-1 px-1 py-0.5 rounded-full text-white"
                       style={{ 
                         backgroundColor: holiday.type === 'national' ? '#ef4444' : 
                                       holiday.type === 'religious' ? '#8b5cf6' : '#f59e0b'
                       }}>
                    {holiday.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Generated with Calendar Generator Tool</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Calendar Settings
              </CardTitle>
              <CardDescription>
                Customize your calendar design and layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={settings.year}
                        onChange={(e) => handleSettingChange('year', parseInt(e.target.value))}
                        min={1900}
                        max={2100}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Select value={settings.month.toString()} onValueChange={(value) => handleSettingChange('month', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Week Starts On</Label>
                    <Select value={settings.startDay} onValueChange={(value: 'sunday' | 'monday') => handleSettingChange('startDay', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showWeekNumbers"
                        checked={settings.showWeekNumbers}
                        onChange={(e) => handleSettingChange('showWeekNumbers', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showWeekNumbers">Show Week Numbers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showHolidays"
                        checked={settings.showHolidays}
                        onChange={(e) => handleSettingChange('showHolidays', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showHolidays">Show Holidays</Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select value={settings.theme} onValueChange={(value: 'default' | 'minimal' | 'colorful' | 'professional') => handleSettingChange('theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Blue)</SelectItem>
                        <SelectItem value="minimal">Minimal (Gray)</SelectItem>
                        <SelectItem value="colorful">Colorful (Pink)</SelectItem>
                        <SelectItem value="professional">Professional (Green)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Paper Size</Label>
                      <Select value={settings.size} onValueChange={(value: 'a4' | 'letter' | 'a3') => handleSettingChange('size', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                          <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                          <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Orientation</Label>
                      <Select value={settings.orientation} onValueChange={(value: 'portrait' | 'landscape') => handleSettingChange('orientation', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showWeekNumbers"
                        checked={settings.showWeekNumbers}
                        onChange={(e) => handleSettingChange('showWeekNumbers', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showWeekNumbers">Show Week Numbers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showHolidays"
                        checked={settings.showHolidays}
                        onChange={(e) => handleSettingChange('showHolidays', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showHolidays">Show Holidays</Label>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Layout Preview</h4>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className="p-1 text-center bg-primary text-primary-foreground rounded">
                          {i === 0 ? 'S' : i === 1 ? 'M' : i === 2 ? 'T' : i === 3 ? 'W' : i === 4 ? 'T' : i === 5 ? 'F' : 'S'}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => (
                        <div key={i} className="p-1 text-center bg-background border rounded text-xs">
                          {i < 3 ? '' : i - 2}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadCalendar} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Calendar
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Download as PDF for printing or digital use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
          
          {showPreview && (
            <div className="flex justify-center">
              <div
                ref={calendarRef}
                className="border rounded-lg shadow-lg bg-white overflow-hidden"
                style={getCalendarStyles()}
              >
                {renderCalendar()}
              </div>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Choose A4 or Letter size for standard printing</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Portrait orientation works best for wall calendars</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Professional theme is perfect for office use</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Holidays are automatically highlighted</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarGenerator;
