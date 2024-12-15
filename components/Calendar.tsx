"use client";
import React, { useState, useEffect } from "react";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventDescription, setNewEventDescription] = useState<string>("");
  const [newEventStartTime, setNewEventStartTime] = useState<string>("");
  const [newEventEndTime, setNewEventEndTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventApi | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        const events = JSON.parse(savedEvents);
        setCurrentEvents(events);
        setFilteredEvents(events);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  useEffect(() => {
    if (filterKeyword) {
      setFilteredEvents(
        currentEvents.filter(
          (event) =>
            event.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            (event.extendedProps.description &&
              event.extendedProps.description
                .toLowerCase()
                .includes(filterKeyword.toLowerCase()))
        )
      );
    } else {
      setFilteredEvents(currentEvents);
    }
  }, [filterKeyword, currentEvents]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setNewEventStartTime(selected.startStr);
    setNewEventEndTime(selected.endStr || "");
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    const { event } = selected;
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.extendedProps.description || "");
    setNewEventStartTime(event.start?.toISOString() || "");
    setNewEventEndTime(event.end?.toISOString() || "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setEditingEvent(null);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && newEventStartTime && newEventEndTime) {
      const calendarApi = selectedDate?.view.calendar;
      if (!calendarApi) return;
      calendarApi.unselect();

      if (editingEvent) {
        editingEvent.setProp("title", newEventTitle);
        editingEvent.setExtendedProp("description", newEventDescription);
        editingEvent.setStart(newEventStartTime);
        editingEvent.setEnd(newEventEndTime);
      } else {
        const newEvent = {
          id: `${newEventStartTime}-${newEventTitle}`,
          title: newEventTitle,
          start: newEventStartTime,
          end: newEventEndTime,
          description: newEventDescription,
        };
        calendarApi.addEvent(newEvent);
      }

      handleCloseDialog();
    }
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      editingEvent.remove();
      handleCloseDialog();
    }
  };

  const handleExportJSON = () => {
    const jsonBlob = new Blob([JSON.stringify(filteredEvents)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.json";
    a.click();
  };

  const handleExportCSV = () => {
    const csv = filteredEvents
      .map((event) => {
        return `${event.title},${formatDate(event.start, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })},${formatDate(event.end, {
          hour: "2-digit",
          minute: "2-digit",
        })},${event.extendedProps.description || ""}`;
      })
      .join("\n");
    const csvBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.csv";
    a.click();
  };

  return (
    <div> 
        <nav className="bg-[#9e3ffd] p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="text-white text-2xl">Dacoid </div>
    
            {/* Menu Items */}
            <div className="space-x-4">
              <a href="/" className="text-white hover:text-[#a3a0ff]">
                Home
              </a>

              <a href="/contact" className="text-white hover:text-[#a3a0ff]">
                Contact
              </a>
            </div>
          </div>
        </nav>
      
    
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>

        
          <input
            type="text"
            placeholder="Search events..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="border border-gray-200 p-3 rounded-md text-lg w-full mb-4"
          />

          <ul className="space-y-4">
            {filteredEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Found
              </div>
            )}

            {filteredEvents.length > 0 &&
              filteredEvents.map((event: EventApi) => (
                <li
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                  key={event.id}
                >
                  <div className="font-bold">{event.title}</div>
                  <div>
                    {formatDate(event.start!, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {event.end &&
                      formatDate(event.end, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                  <div className="text-gray-600 italic">
                    {event.extendedProps.description || "No description provided"}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={currentEvents}
          />
        </div>
      </div>


      <div className="w-full flex justify-start mt-8 px-10">
        <button
          className="bg-[#cc00c8] text-white p-3 rounded-md mr-4"
          onClick={handleExportJSON}
        >
          Export as JSON
        </button>
        <button
          className="bg-[#cc00c8] text-white p-3 rounded-md mr-4"
          onClick={handleExportCSV}
        >
          Export as CSV
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event Details" : "Add New Event Details"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <input
              type="datetime-local"
              value={newEventStartTime}
              onChange={(e) => setNewEventStartTime(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <input
              type="datetime-local"
              value={newEventEndTime}
              onChange={(e) => setNewEventEndTime(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <textarea
              placeholder="Event Description (Optional)"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <div className="flex gap-4">
              <button
                className="bg-green-500 text-white p-3 rounded-md"
                type="submit"
              >
                {editingEvent ? "Save Changes" : "Add"}
              </button>
              {editingEvent && (
                <button
                  type="button"
                  className="bg-red-500 text-white p-3 rounded-md"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className="bg-gray-300 text-black p-3 rounded-md"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
