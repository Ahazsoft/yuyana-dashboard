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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Tours",
      url: "/admin/tours",
      icon: IconRoute,
    },
    {
      title: "Bookings",
      url: "/admin/bookings",
      icon: IconCalendarCheck,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: IconCreditCard,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: IconMessageStar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
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
                  Yuyan Admin
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
