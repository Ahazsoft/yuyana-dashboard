"use client";

import {
  IconCalendarCheck,
  IconCreditCard,
  IconDashboard,
  IconHelp,
  IconMapPin,
  IconMessageStar,
  IconRoute,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

// Adding mock data for customers, leads, and other sections
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Leads",
      url: "/admin/leads",
      icon: IconSearch,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: IconHelp,
    },
    {
      title: "Tours",
      url: "/admin/tours",
      icon: IconMapPin,
    },
    {
      title: "Bookings",
      url: "/admin/bookings",
      icon: IconCalendarCheck,
    },{
      title: "Review",
      url: "/admin/review",
      icon: IconCalendarCheck,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/admin/help",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'>
              <a href='#' className='flex justify-start h-full'>
                <div className='h-full'>
                  <Image
                    src='/yuyanlogo.png'
                    width={60}
                    height={100}
                    className='object-cover'
                    alt='Travel With Yuyan Logo'
                  />
                </div>
                <span className='text-base font-semibold mt-2.5'>
                  Yuyana {/* {} */}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
    </Sidebar>
  );
}
