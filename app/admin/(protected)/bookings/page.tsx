"use client";

import { useState, useMemo } from "react";
import { bookings as initialBookings } from "@/lib/bookings-data";
import { Booking, BookingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  X,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: BookingStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "canceled",
];

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking) => {
      const matchesSearch =
        booking.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.customerEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.tourTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || booking.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus, allBookings]);

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setAllBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    );

    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    toast.success(`Booking ${bookingId} updated`, {
      description: `Status changed to ${newStatus}.`,
    });
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge className='bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none capitalize px-3 py-1 rounded-full gap-1.5'>
            <Clock className='w-3.5 h-3.5' />
            New Request
          </Badge>
        );
      case "contacted":
        return (
          <Badge className='bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none capitalize px-3 py-1 rounded-full gap-1.5'>
            <MessageSquare className='w-3.5 h-3.5' />
            Contacted
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className='bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none capitalize px-3 py-1 rounded-full gap-1.5'>
            <CheckCircle2 className='w-3.5 h-3.5' />
            Confirmed
          </Badge>
        );
      case "canceled":
        return (
          <Badge className='bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none capitalize px-3 py-1 rounded-full gap-1.5'>
            <AlertCircle className='w-3.5 h-3.5' />
            Canceled
          </Badge>
        );
    }
  };

  return (
    <div className='min-h-screen pt-6 max-w-7xl mx-auto'>
      <div className='px-6 mb-8'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Booking Management
            </h1>
            <p className='text-muted-foreground mt-1'>
              Track and manage customer tour requests and their status.
            </p>
          </div>
        </div>

        <div className='bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[1.5rem] p-3 shadow-sm flex flex-col lg:flex-row gap-4'>
          <div className='relative flex-1 group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
            <Input
              placeholder='Search by name, email, or tour...'
              className='pl-12 h-12 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-xl focus-visible:ring-0 text-base'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='flex flex-wrap gap-2 items-center'>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-45 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-none'>
                <Filter className='w-4 h-4 mr-2 text-muted-foreground' />
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='All'>All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className='capitalize'>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || selectedStatus !== "All") && (
              <Button
                variant='ghost'
                size='icon'
                className='h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10'
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}>
                <X className='w-5 h-5' />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className='px-6 pb-20'>
        <div className='bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50/50 dark:bg-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50'>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Customer
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Contact Info
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Tour & Date
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Guests
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Total Price
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold h-auto'>
                  Status
                </TableHead>
                <TableHead className='px-6 py-4 text-sm font-semibold text-right h-auto'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className='border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors'>
                    <TableCell className='px-6 py-4'>
                      <span className='font-semibold text-slate-900 dark:text-zinc-100'>
                        {booking.customerName}
                      </span>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-xs text-muted-foreground flex items-center'>
                          <Mail className='w-3 h-3 mr-1.5 text-primary' />
                          {booking.customerEmail}
                        </span>
                        <span className='text-xs text-muted-foreground flex items-center'>
                          <Phone className='w-3 h-3 mr-1.5 text-primary' />
                          {booking.customerPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex flex-col gap-1'>
                        <span className='font-medium text-slate-700 dark:text-zinc-300'>
                          {booking.tourTitle}
                        </span>
                        <span className='text-xs text-muted-foreground flex items-center'>
                          <Calendar className='w-3 h-3 mr-1.5 text-primary' />
                          {booking.travelDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-1.5'>
                        <Users className='w-4 h-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          {booking.guests}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <span className='font-bold text-slate-900 dark:text-zinc-100'>
                        {booking.totalPrice.toLocaleString()} ETB
                      </span>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className='px-6 py-4 text-right'>
                      <div className='flex justify-end items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='rounded-lg h-9 w-9 p-0'
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsOpen(true);
                          }}>
                          <Eye className='w-4 h-4 text-muted-foreground' />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='rounded-lg h-9 w-9 p-0'>
                              <MoreVertical className='w-4 h-4 text-muted-foreground' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='end'
                            className='w-48 rounded-xl p-2 drop-shadow-2xl'>
                            <DropdownMenuLabel className='font-bold'>
                              Change Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  handleStatusChange(booking.id, status)
                                }
                                className={cn(
                                  "rounded-lg capitalize transition-colors",
                                  booking.status === status &&
                                    "bg-primary/10 text-primary font-medium",
                                )}>
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className='py-20 text-center'>
                    <div className='bg-slate-50 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner'>
                      <Search className='w-8 h-8 text-muted-foreground opacity-20' />
                    </div>
                    <h3 className='text-lg font-bold'>No bookings found</h3>
                    <p className='text-muted-foreground mt-1'>
                      Try adjusting your filters or search terms.
                    </p>
                    <Button
                      variant='outline'
                      className='mt-4 rounded-xl px-6'
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStatus("All");
                      }}>
                      Clear all filters
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Booking Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className='sm:max-w-xl overflow-y-auto px-8 py-10'>
          {selectedBooking && (
            <>
              <SheetHeader className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-bold tracking-widest text-muted-foreground uppercase'>
                    Booking ID: {selectedBooking.id}
                  </span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <SheetTitle className='text-3xl font-bold'>
                  {selectedBooking.customerName}
                </SheetTitle>
                <SheetDescription className='text-lg'>
                  Detailed request for {selectedBooking.tourTitle}
                </SheetDescription>
              </SheetHeader>

              <div className='grid gap-10'>
                <div className='grid gap-4'>
                  <h4 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                    Customer Contact
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800'>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Email Address
                      </p>
                      <p className='font-semibold flex items-center gap-2'>
                        <Mail className='w-4 h-4 text-primary' />{" "}
                        {selectedBooking.customerEmail}
                      </p>
                    </div>
                    <div className='bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800'>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Phone Number
                      </p>
                      <p className='font-semibold flex items-center gap-2'>
                        <Phone className='w-4 h-4 text-primary' />{" "}
                        {selectedBooking.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid gap-4'>
                  <h4 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                    Trip Details
                  </h4>
                  <div className='bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden relative'>
                    <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl' />
                    <div className='relative grid grid-cols-2 gap-8'>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Tour Name</p>
                        <p className='text-xl font-bold'>{selectedBooking.tourTitle}</p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Travel Date</p>
                        <p className='text-xl font-bold flex items-center gap-2'>
                          <Calendar className='w-5 h-5 text-primary' />{" "}
                          {selectedBooking.travelDate}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Number of Guests</p>
                        <p className='text-xl font-bold flex items-center gap-2'>
                          <Users className='w-5 h-5 text-primary' />{" "}
                          {selectedBooking.guests} People
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Total Amount</p>
                        <p className='text-2xl font-black text-primary'>
                          {selectedBooking.totalPrice.toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.message && (
                  <div className='grid gap-4'>
                    <h4 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                      Customer Message
                    </h4>
                    <div className='bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-5 italic text-slate-700 dark:text-zinc-300'>
                      {selectedBooking.message}
                    </div>
                  </div>
                )}

                <div className='grid gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800'>
                  <h4 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                    Update Booking Status
                  </h4>
                  <div className='grid grid-cols-2 gap-3'>
                    {STATUS_OPTIONS.map((status) => (
                      <Button
                        key={status}
                        variant={
                          selectedBooking.status === status
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "h-14 rounded-2xl capitalize font-bold",
                          selectedBooking.status === status &&
                            "shadow-lg shadow-primary/20",
                        )}
                        onClick={() =>
                          handleStatusChange(selectedBooking.id, status)
                        }>
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
