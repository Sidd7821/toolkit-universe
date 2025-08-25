import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Trash2, Edit, Play, Pause, Star, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CountdownEvent {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  category: string;
  isActive: boolean;
  isFavorite: boolean;
  color: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EventCountdownTimer = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CountdownEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
    targetTime: "",
    category: "personal",
    color: "#3b82f6"
  });

  const categories = [
    { value: "personal", label: "Personal", icon: "👤" },
    { value: "work", label: "Work", icon: "💼" },
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💕" },
    { value: "holiday", label: "Holiday", icon: "🎉" },
    { value: "deadline", label: "Deadline", icon: "⏰" }
  ];

  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

  const calculateTimeLeft = (targetDate: Date): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    if (currentEventId) {
      const event = events.find(e => e.id === currentEventId);
      if (event && event.isActive) {
        const interval = setInterval(() => {
          const timeLeft = calculateTimeLeft(event.targetDate);
          setTimeLeft(timeLeft);
          
          if (timeLeft.days === 0 && timeLeft.hours === 0 && 
              timeLeft.minutes === 0 && timeLeft.seconds === 0) {
            handleCountdownFinished(event);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [currentEventId, events]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('countdownEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        targetDate: new Date(event.targetDate),
      }));
      setEvents(parsedEvents);
      
      const firstActive = parsedEvents.find((e: CountdownEvent) => e.isActive);
      if (firstActive) {
        setCurrentEventId(firstActive.id);
        setTimeLeft(calculateTimeLeft(firstActive.targetDate));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('countdownEvents', JSON.stringify(events));
  }, [events]);

  const handleCountdownFinished = (event: CountdownEvent) => {
    toast({
      title: "Countdown Finished! 🎉",
      description: `${event.title} has arrived!`,
    });
    
    setEvents(prev => prev.map(e => 
      e.id === event.id ? { ...e, isActive: false } : e
    ));
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and target date",
        variant: "destructive",
      });
      return;
    }

    const targetDateTime = new Date(`${formData.targetDate}T${formData.targetTime || '00:00'}`);
    
    if (targetDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Target date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const newEvent: CountdownEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      targetDate: targetDateTime,
      category: formData.category,
      isActive: true,
      isFavorite: false,
      color: formData.color
    };

    setEvents(prev => [newEvent, ...prev]);
    setShowAddForm(false);
    resetForm();
    
    if (events.length === 0) {
      setCurrentEventId(newEvent.id);
      setTimeLeft(calculateTimeLeft(newEvent.targetDate));
    }

    toast({
      title: "Event Added!",
      description: `Countdown for "${newEvent.title}" has started`,
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    if (!formData.title || !formData.targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and target date",
        variant: "destructive",
      });
      return;
    }

    const targetDateTime = new Date(`${formData.targetDate}T${formData.targetTime || '00:00'}`);
    
    if (targetDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Target date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: CountdownEvent = {
      ...selectedEvent,
      title: formData.title,
      description: formData.description,
      targetDate: targetDateTime,
      category: formData.category,
      color: formData.color
    };

    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setIsEditing(false);
    setSelectedEvent(null);
    resetForm();
    
    toast({
      title: "Event Updated!",
      description: `Countdown for "${updatedEvent.title}" has been updated`,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    
    if (currentEventId === eventId) {
      const nextEvent = events.find(e => e.id !== eventId && e.isActive);
      if (nextEvent) {
        setCurrentEventId(nextEvent.id);
        setTimeLeft(calculateTimeLeft(nextEvent.targetDate));
      } else {
        setCurrentEventId(null);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }
    
    toast({
      title: "Event Deleted",
      description: "Countdown event has been removed",
    });
  };

  const handleToggleEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, isActive: !e.isActive } : e
    ));
    
    if (currentEventId === eventId) {
      const event = events.find(e => e.id === eventId);
      if (event && !event.isActive) {
        setCurrentEventId(eventId);
        setTimeLeft(calculateTimeLeft(event.targetDate));
      } else {
        const nextEvent = events.find(e => e.id !== eventId && e.isActive);
        if (nextEvent) {
          setCurrentEventId(nextEvent.id);
          setTimeLeft(calculateTimeLeft(nextEvent.targetDate));
        } else {
          setCurrentEventId(null);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    }
  };

  const handleToggleFavorite = (eventId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, isFavorite: !e.isFavorite } : e
    ));
  };

  const handleSelectEvent = (event: CountdownEvent) => {
    setSelectedEvent(event);
    setCurrentEventId(event.id);
    setTimeLeft(calculateTimeLeft(event.targetDate));
    
    setFormData({
      title: event.title,
      description: event.description || "",
      targetDate: event.targetDate.toISOString().split('T')[0],
      targetTime: event.targetDate.toTimeString().slice(0, 5),
      category: event.category,
      color: event.color
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      targetDate: "",
      targetTime: "",
      category: "personal",
      color: "#3b82f6"
    });
  };

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : "📌";
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Clock className="text-4xl text-blue-500" />
          Event Countdown Timer
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create countdown timers for your important events and never miss a moment!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Countdown Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Countdown */}
          {currentEventId && events.find(e => e.id === currentEventId) ? (
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Target className="h-6 w-6" />
                  {events.find(e => e.id === currentEventId)?.title}
                </CardTitle>
                <CardDescription>
                  {events.find(e => e.id === currentEventId)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary">
                      {formatTime(timeLeft.days)}
                    </div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary">
                      {formatTime(timeLeft.hours)}
                    </div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary">
                      {formatTime(timeLeft.minutes)}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary">
                      {formatTime(timeLeft.seconds)}
                    </div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Countdown</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first countdown event to get started
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add/Edit Event Form */}
          {(showAddForm || isEditing) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {isEditing ? 'Edit Event' : 'Add New Event'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your countdown event details' : 'Create a new countdown timer'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Birthday Party, Project Deadline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add details about your event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetDate">Target Date *</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetTime">Target Time</Label>
                    <Input
                      id="targetTime"
                      type="time"
                      value={formData.targetTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Event Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={isEditing ? handleEditEvent : handleAddEvent}
                    className="flex-1"
                  >
                    {isEditing ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditing(false);
                      setSelectedEvent(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="w-full"
                disabled={showAddForm || isEditing}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </CardContent>
          </Card>

          {/* Event List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Events</CardTitle>
              <CardDescription>
                {events.filter(e => e.isActive).length} active, {events.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No events yet</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        currentEventId === event.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getCategoryIcon(event.category)}</span>
                            <h4 className="font-medium truncate">{event.title}</h4>
                            {event.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.targetDate.toLocaleDateString()} at {event.targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(event.id);
                            }}
                          >
                            <Star className={`h-3 w-3 ${event.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEvent(event.id);
                            }}
                          >
                            {event.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventCountdownTimer;

