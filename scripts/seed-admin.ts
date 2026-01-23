import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  // const email = "admin@yuyana.com";
  // const password = "password123";
  // const name = "Admin User";


  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Admin user already exists");
    return;
  }

 
  try {
     const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
     });
     console.log("Admin user created successfully:", res);
  } catch (e) {
      console.error("Failed to create admin via API, trying manual DB insertion (careful with hash)...");
      console.error(e);
  }
}

main().catch(console.error);
